import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import User from "../models/User.js";

export const bookingTicket = async (req, res) => {
  const { ticketId, eventId, type, quantity } = req.body;

  const userId = req.user._id;

  const attendeeInfo = {
    name: req.user.userName,
    email: req.user.email,
    phone: req.user.phone,
  };

  const bookingCode = uuidv4();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new Error("Event not found");
    }

    if (new Date(event.endDate) < new Date()) {
      throw new Error("Event is ended");
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      event: eventId,
      type,
      status: "active",
      isActive: true,
    }).session(session);

    if (!ticket || ticket.availableQuantity < quantity) {
      throw new Error("Tickets not available");
    }

    const totalPrice = ticket.price * quantity;

    const [booking] = await Booking.create(
      [
        {
          user: userId,
          event: eventId,
          ticket: ticket._id,
          quantity,
          totalPrice,
          status: "pending",
          paymentStatus: "pending",
          attendeeInfo: attendeeInfo,
          bookingCode,
        },
      ],
      { session }
    );

    ticket.availableQuantity -= quantity;
    await ticket.save({ session });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { ticketsBooked: booking._id } },
      { session, new: true }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Booking confirmed",
      bookingId: booking._id,
      totalPrice,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Booking error:", error);
    return res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
};

/**
 * إنشاء حجز جديد مع الدفع الآمن
 * هذه الدالة تُنشئ حجز مؤقت ولا تخصم التذاكر حتى تأكيد الدفع عبر webhook
 */
export const createBookingWithSecurePayment = async (req, res) => {
  const {
    ticketId,
    eventId,
    type,
    quantity,
    paymentMethod = "card",
  } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ التحقق من الحدث
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new Error("الحدث غير موجود");
    }

    if (new Date(event.endDate) < new Date()) {
      throw new Error("الحدث منتهى");
    }

    // ✅ التحقق من التذكرة والكمية المتاحة
    const ticket = await Ticket.findOne({
      _id: ticketId,
      event: eventId,
      type,
      status: "active",
      isActive: true,
    }).session(session);

    if (!ticket) {
      throw new Error("التذكرة غير متاحة");
    }

    if (ticket.availableQuantity < quantity) {
      throw new Error(`عدد التذاكر المتاحة: ${ticket.availableQuantity} فقط`);
    }

    // ✅ حساب السعر الإجمالي
    const totalPrice = ticket.price * quantity;

    // ✅ معلومات المستخدم
    const attendeeInfo = {
      name: req.user.userName,
      email: req.user.email,
      phone: req.user.phone,
    };

    // ✅ إنشاء الحجز بحالة pending (بدون خصم التذاكر بعد)
    const [booking] = await Booking.create(
      [
        {
          user: userId,
          event: eventId,
          ticket: ticket._id,
          quantity,
          totalPrice,
          status: "pending", // ⚠️ مهم: الحجز مُعلَّق حتى تأكيد الدفع
          paymentStatus: "pending",
          paymentMethod,
          attendeeInfo,
        },
      ],
      { session }
    );

    // ✅ حجز التذاكر مؤقتاً (خصم مؤقت يمكن إرجاعه)
    ticket.availableQuantity -= quantity;
    await ticket.save({ session });

    // ✅ تحديث قائمة حجوزات المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $push: { ticketsBooked: booking._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // ✅ إرجاع معلومات الحجز للفرونت مع تعليمات الدفع
    return res.status(201).json({
      success: true,
      message: "تم إنشاء الحجز بنجاح، يرجى إتمام عملية الدفع",
      booking: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        totalPrice,
        currency: ticket.currency,
        status: "pending_payment",
      },
      paymentDetails: {
        reference: booking.bookingCode, // سنستخدم bookingCode كمرجع للدفع
        amount: totalPrice * 100, // تحويل إلى قروش/سنت
        currency: ticket.currency,
        description: `تذكرة ${event.title} - ${ticket.type}`,
        customer: {
          email: attendeeInfo.email,
          name: attendeeInfo.name,
          phone: attendeeInfo.phone,
        },
        metadata: {
          bookingId: booking._id.toString(),
          eventId: eventId.toString(),
          ticketId: ticketId.toString(),
          userId: userId.toString(),
          quantity,
        },
      },
      instructions: [
        "تم حجز التذاكر مؤقتاً لمدة 15 دقيقة",
        "يرجى إتمام عملية الدفع لتأكيد الحجز",
        "في حالة عدم الدفع خلال 15 دقيقة، سيتم إلغاء الحجز تلقائياً",
      ],
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Secure booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في إنشاء الحجز",
      error: error.message,
    });
  }
};

/**
 * إلغاء الحجز المؤقت (في حالة فشل الدفع أو انتهاء المهلة)
 */
export const cancelPendingBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // العثور على الحجز
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: "pending",
      paymentStatus: "pending",
    })
      .populate("ticket")
      .session(session);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود أو لا يمكن إلغاؤه",
      });
    }

    // إلغاء الحجز
    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save({ session });

    // إعادة التذاكر إلى المخزون
    await Ticket.findByIdAndUpdate(
      booking.ticket._id,
      { $inc: { availableQuantity: booking.quantity } },
      { session }
    );

    // إزالة الحجز من قائمة حجوزات المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $pull: { ticketsBooked: booking._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "تم إلغاء الحجز بنجاح",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Cancel booking error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في إلغاء الحجز",
      error: error.message,
    });
  }
};

/**
 * التحقق من حالة الحجز
 */
export const getBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate("event", "title startDate endDate location")
      .populate("ticket", "type price currency")
      .populate("user", "userName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // البحث عن معلومات الدفعة إن وجدت
    const payment = await Payment.findOne({ booking: booking._id });

    return res.status(200).json({
      success: true,
      booking: {
        id: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        quantity: booking.quantity,
        createdAt: booking.createdAt,
        qrCode: booking.qrCode,
        event: booking.event,
        ticket: booking.ticket,
        attendeeInfo: booking.attendeeInfo,
      },
      payment: payment
        ? {
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            paidAt: payment.capturedAt,
            amount: payment.amount,
            currency: payment.currency,
          }
        : null,
    });
  } catch (error) {
    console.error("Get booking status error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في جلب حالة الحجز",
      error: error.message,
    });
  }
};

/**
 * الحصول على جميع حجوزات المستخدم
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      status,
      paymentStatus,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // بناء الاستعلام
    let query = { user: userId };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // الترقيم
    const skip = (page - 1) * limit;

    // الترتيب
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // تنفيذ الاستعلام
    const [bookings, totalCount] = await Promise.all([
      Booking.find(query)
        .populate("event", "title startDate endDate location images category")
        .populate("ticket", "type price currency")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),

      Booking.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في جلب الحجوزات",
      error: error.message,
    });
  }
};

// ====================================================
// دوال إدارة الحجوزات للمنظمين
// ====================================================

/**
 * الحصول على جميع حجوزات أحداث المنظم
 */
export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

    // العثور على جميع الأحداث التي أنشأها هذا المنظم
    const organizerEvents = await Event.find({ organizer: organizerId }).select(
      "_id"
    );
    const eventIds = organizerEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        bookings: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalBookings: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // بناء استعلام البحث
    let query = { event: { $in: eventIds } };

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: "i" } },
        { "attendeeInfo.name": { $regex: search, $options: "i" } },
        { "attendeeInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    // حساب الترقيم
    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    // الحصول على الحجوزات مع البيانات المرتبطة
    const bookings = await Booking.find(query)
      .populate({
        path: "event",
        select: "title startDate endDate location category images",
      })
      .populate({
        path: "user",
        select: "userName email phone",
      })
      .populate({
        path: "ticket",
        select: "type price currency",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get organizer bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/**
 * الحصول على تفاصيل حجز بالمعرف
 */
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const organizerId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "event",
        select:
          "title description startDate endDate time location category images organizer maxAttendees",
      })
      .populate({
        path: "user",
        select: "userName email phone createdAt",
      })
      .populate({
        path: "ticket",
        select: "type price currency description features",
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // التأكد من أن الحجز يخص حدث للمنظم
    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({
      message: "Failed to fetch booking details",
      error: error.message,
    });
  }
};

/**
 * تحديث حالة الحجز
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const organizerId = req.user._id;

    // التحقق من صحة الحالة
    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: pending, confirmed, or cancelled",
      });
    }

    const booking = await Booking.findById(bookingId).populate("event");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // التأكد من أن الحجز يخص حدث للمنظم
    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // تحديث حالة الحجز
    booking.status = status;

    // إذا تم الإلغاء، قم بتحديث حالة الدفع أيضاً
    if (status === "cancelled") {
      booking.paymentStatus = "failed";
    }

    await booking.save();

    res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

/**
 * get booking for a specific event
 */
export const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // sure that the event belongs to the organizer
    const event = await Event.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
    }

    // building query
    let query = { event: eventId };
    if (status) {
      query.status = status;
    }

    // calculating pagination
    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    // getting bookings

    const bookings = await Booking.find(query)
      .populate("user", "userName email phone")
      .populate("ticket", "type price currency")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      event: {
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get event bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch event bookings",
      error: error.message,
    });
  }
};

/**
 * get detailed bookings with advanced information
 */
export const getDetailedBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      paymentStatus, 
      search, 
      eventId,
      sortOrder = 'desc'
    } = req.query;

    // finding organizer events
    const organizerEvents = await Event.find({ organizer: organizerId }).select("_id title");
    const eventIds = organizerEvents.map(event => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        bookings: [],
        pagination: { currentPage: 1, totalPages: 0, totalBookings: 0, hasNext: false, hasPrev: false },
        summary: { totalRevenue: 0, totalTickets: 0, averageOrderValue: 0 }
      });
    }

    // building query for simplified search
    let query = { event: { $in: eventIds } };

    // simplified filters
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (eventId) query.event = eventId;

    // text search
    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'attendeeInfo.name': { $regex: search, $options: 'i' } },
        { 'attendeeInfo.email': { $regex: search, $options: 'i' } },
        { 'attendeeInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // pagination and sorting
    const skip = (page - 1) * limit;
    const sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };

    // executing the query with detailed data
    const [bookings, totalBookings] = await Promise.all([
      Booking.find(query)
        .populate({
          path: 'event',
          select: 'title startDate endDate location category images maxAttendees',
          populate: {
            path: 'organizer',
            select: 'firstName lastName email'
          }
        })
        .populate({
          path: 'user',
          select: 'userName email phone createdAt lastLogin profileImage',
          populate: {
            path: 'ticketsBooked',
            select: 'createdAt totalPrice',
            options: { limit: 5 }
          }
        })
        .populate({
          path: 'ticket',
          select: 'type price currency description features availableQuantity quantity'
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),

      Booking.countDocuments(query)
    ]);

    // calculating statistics
    const summary = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalPrice', 0] } },
          totalTickets: { $sum: '$quantity' },
          completedBookings: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // enriching bookings with additional information
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      // calculating user booking count
      const userBookingCount = await Booking.countDocuments({
        user: booking.user._id,
        paymentStatus: 'completed'
      });

      // calculating event occupancy rate
      const eventBookings = await Booking.aggregate([
        { $match: { event: booking.event._id, paymentStatus: 'completed' } },
        { $group: { _id: null, totalTickets: { $sum: '$quantity' } } }
      ]);

      const occupancyRate = eventBookings.length > 0 
        ? ((eventBookings[0].totalTickets / booking.event.maxAttendees) * 100).toFixed(1)
        : 0;

      return {
        ...booking.toObject(),
        userStats: {
          totalBookings: userBookingCount,
          isReturningCustomer: userBookingCount > 1,
          customerSince: booking.user.createdAt,
          lastLogin: booking.user.lastLogin
        },
        eventStats: {
          occupancyRate: parseFloat(occupancyRate),
          remainingCapacity: booking.event.maxAttendees - (eventBookings.length > 0 ? eventBookings[0].totalTickets : 0)
        },
        ticketStats: {
          availabilityPercentage: ((booking.ticket.availableQuantity / booking.ticket.quantity) * 100).toFixed(1)
        }
      };
    }));

    const totalPages = Math.ceil(totalBookings / limit);

    res.status(200).json({
      success: true,
      bookings: enrichedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary: summary.length > 0 ? {
        totalRevenue: summary[0].totalRevenue || 0,
        totalTickets: summary[0].totalTickets || 0,
        completedBookings: summary[0].completedBookings || 0,
        averageOrderValue: summary[0].averageOrderValue || 0
      } : { totalRevenue: 0, totalTickets: 0, completedBookings: 0, averageOrderValue: 0 }
    });

  } catch (error) {
    console.error('Get detailed bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed bookings',
      error: error.message
    });
  }
};

/**
 * get booking statistics for organizer dashboard
 */
export const getBookingStats = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { eventId, startDate, endDate } = req.query;

    // find events for the organizer
    let eventQuery = { organizer: organizerId };
    if (eventId) {
      eventQuery._id = eventId;
    }

    const organizerEvents = await Event.find(eventQuery).select("_id");
    const eventIds = organizerEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        recentBookings: [],
      });
    }

    // building date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // get booking query 
    const bookingQuery = { event: { $in: eventIds }, ...dateFilter };

    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(bookingQuery),
      Booking.countDocuments({ ...bookingQuery, status: "confirmed" }),
      Booking.countDocuments({ ...bookingQuery, status: "pending" }),
      Booking.countDocuments({ ...bookingQuery, status: "cancelled" }),
      Booking.aggregate([
        { $match: { ...bookingQuery, paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.find(bookingQuery)
        .populate("event", "title startDate")
        .populate("user", "userName email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      recentBookings,
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      message: "Failed to fetch booking statistics",
      error: error.message,
    });
  }
};
