import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const validateBookingData = (data) => {
  const errors = [];
  if (!data.ticketId) errors.push("معرف التذكرة مطلوب");
  if (!data.eventId) errors.push("معرف الحدث مطلوب");
  if (!data.quantity || data.quantity <= 0)
    errors.push("الكمية يجب أن تكون أكبر من صفر");
  return errors;
};

const validateEvent = async (eventId, session) => {
  const event = await Event.findById(eventId).session(session);
  if (!event) throw new Error("الحدث غير موجود");
  if (new Date(event.endDate) < new Date())
    throw new Error("الحدث منتهى ولا يمكن الحجز");
  return event;
};

const validateTicket = async (ticketId, eventId, type, quantity, session) => {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    event: eventId,
    ...(type && { type }),
    status: "active",
    isActive: true,
  }).session(session);

  if (!ticket) throw new Error("التذكرة غير موجودة أو غير نشطة");
  if (ticket.availableQuantity < quantity) {
    throw new Error(
      `الكمية المتاحة غير كافية. المتاح: ${ticket.availableQuantity}، المطلوب: ${quantity}`
    );
  }
  return ticket;
};

const createAttendeeInfo = (user) => ({
  name: user.userName || `${user.firstName} ${user.lastName}`,
  email: user.email,
  phone: user.phone,
});

/**
 * @deprecated
 */
export const bookingTicket = async (req, res) => {
  const { ticketId, eventId, type, quantity } = req.body;
  const userId = req.user._id;

  const validationErrors = validateBookingData({ ticketId, eventId, quantity });
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "بيانات غير صحيحة",
      errors: validationErrors,
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await validateEvent(eventId, session);

      const updatedTicket = await Ticket.findOneAndUpdate(
        {
          _id: ticketId,
          event: eventId,
          ...(type && { type }),
          status: "active",
          isActive: true,
          availableQuantity: { $gte: quantity },
        },
        { $inc: { availableQuantity: -quantity } },
        { new: true, session }
      );

      if (!updatedTicket) {
        throw new Error("التذاكر غير متاحة أو الكمية غير كافية");
      }

      const totalPrice = updatedTicket.price * quantity;
      const attendeeInfo = createAttendeeInfo(req.user);

      const [booking] = await Booking.create(
        [
          {
            user: userId,
            event: eventId,
            ticket: updatedTicket._id,
            quantity,
            totalPrice,
            status: "confirmed",
            paymentStatus: "completed",
            attendeeInfo,
          },
        ],
        { session }
      );

      await User.findByIdAndUpdate(
        userId,
        { $push: { ticketsBooked: booking._id } },
        { session }
      );

      logger.info(`Booking created successfully: ${booking._id}`);
    });

    res.status(201).json({
      success: true,
      message: "تم تأكيد الحجز بنجاح",
    });
  } catch (error) {
    logger.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في إنشاء الحجز",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export const createBookingWithSecurePayment = async (req, res) => {
  const {
    ticketId,
    eventId,
    type,
    quantity,
    paymentMethod = "card",
  } = req.body;
  const userId = req.user._id;

  const validationErrors = validateBookingData({ ticketId, eventId, quantity });
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "البيانات المطلوبة مفقودة أو غير صحيحة",
      errors: validationErrors,
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const event = await validateEvent(eventId, session);

      const ticket = await validateTicket(
        ticketId,
        eventId,
        type,
        quantity,
        session
      );

      const totalPrice = ticket.price * quantity;
      const attendeeInfo = createAttendeeInfo(req.user);

      const booking = new Booking({
        user: userId,
        event: eventId,
        ticket: ticket._id,
        quantity,
        totalPrice,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        attendeeInfo,
      });

      await booking.save({ session });

      await User.findByIdAndUpdate(
        userId,
        { $push: { ticketsBooked: booking._id } },
        { session }
      );

      logger.info(`Secure booking created: ${booking._id}`);

      const responseData = {
        success: true,
        message: "تم إنشاء الحجز بنجاح، يرجى إتمام عملية الدفع",
        booking: {
          bookingId: booking._id,
          bookingCode: booking.bookingCode,
          totalPrice,
          currency: ticket.currency || "EGP",
          status: "pending_payment",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        paymentDetails: {
          reference: booking.bookingCode,
          amount: totalPrice * 100,
          currency: ticket.currency || "EGP",
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
          "تم إنشاء الحجز مؤقتاً لمدة 15 دقيقة",
          "يرجى إتمام عملية الدفع لتأكيد الحجز وخصم التذاكر",
          "في حالة عدم الدفع خلال 15 دقيقة، سيتم إلغاء الحجز تلقائياً",
          "سيتم خصم التذاكر من المخزون عند تأكيد الدفع فقط",
        ],
      };

      res.status(201).json(responseData);
    });
  } catch (error) {
    logger.error("Secure booking creation error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "خطأ في إنشاء الحجز، يرجى المحاولة مرة أخرى",
        error: "كود الحجز مكرر",
      });
    }

    res.status(500).json({
      success: false,
      message: "فشل في إنشاء الحجز",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "خطأ داخلي في الخادم",
    });
  } finally {
    await session.endSession();
  }
};

export const cancelPendingBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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

    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save({ session });

    await Ticket.findByIdAndUpdate(
      booking.ticket._id,
      { $inc: { availableQuantity: booking.quantity } },
      { session }
    );

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
      const bookingByCode = await Booking.findOne({
        bookingCode: bookingId,
      })
        .populate("event", "title startDate endDate location")
        .populate("ticket", "type price currency")
        .populate("user", "userName email");

      if (!bookingByCode) {
        return res.status(404).json({
          success: false,
          message: "الحجز غير موجود",
        });
      }

      if (
        bookingByCode.user &&
        bookingByCode.user._id.toString() !== userId.toString()
      ) {
        if (req.user.role !== "admin" && req.user.role !== "organizer") {
          return res.status(403).json({
            success: false,
            message: "غير مصرح لك بالوصول إلى هذا الحجز",
          });
        }
      }

      const payment = await Payment.findOne({ booking: bookingByCode._id });

      return res.status(200).json({
        success: true,
        booking: {
          id: bookingByCode._id,
          bookingCode: bookingByCode.bookingCode,
          status: bookingByCode.status,
          paymentStatus: bookingByCode.paymentStatus,
          totalPrice: bookingByCode.totalPrice,
          quantity: bookingByCode.quantity,
          createdAt: bookingByCode.createdAt,
          qrCode: bookingByCode.qrCode,
          event: bookingByCode.event,
          ticket: bookingByCode.ticket,
          attendeeInfo: bookingByCode.attendeeInfo,
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
    }

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

    let query = { user: userId };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

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

export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

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

    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

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

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const organizerId = req.user._id;

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

    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = status;

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

export const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const event = await Event.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
    }

    let query = { event: eventId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

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

export const getBookingStats = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { eventId, startDate, endDate } = req.query;

    let eventQuery = { organizer: organizerId };
    if (eventId) eventQuery._id = eventId;

    const organizerEvents = await Event.find(eventQuery).select("_id");
    const eventIds = organizerEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        recentBookings: [],
      });
    }

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

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
      success: true,
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      recentBookings,
    });
  } catch (error) {
    logger.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات الحجوزات",
      error: error.message,
    });
  }
};
