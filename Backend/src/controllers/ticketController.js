import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";

// ✅ ALLOWED: Organizers can CREATE ticket types for their events
export const createTicket = asyncHandler(async (req, res) => {
  const {
    eventId,
    type,
    price,
    quantity,
    availableQuantity,
    description,
    features,
    saleStartDate,
    saleEndDate,
    status,
  } = req.body;

  const ticket = await Ticket.create({
    event: eventId,
    type,
    price,
    quantity,
    availableQuantity,
    description,
    features,
    status: status || "active",
    saleStartDate,
    saleEndDate,
    createdBy: req.user._id,
  });

  await Event.findByIdAndUpdate(
    eventId,
    { $push: { tickets: ticket._id } },
    { new: true }
  );

  res.status(201).json(ticket);
});

export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find()
    .populate("event", "title date")
    .populate("createdBy", "name email role");

  res.json(tickets);
});

// ✅ ALLOWED: Organizers can VIEW specific ticket details
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("event", "title date")
    .populate("createdBy", "name email role");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  res.json(ticket);
});

// ✅ ALLOWED: Organizers can VIEW tickets for specific events
export const getTicketsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  // Find all tickets for this event
  const tickets = await Ticket.find({
    event: eventId,
    isActive: true,
  })
    .populate("event", "title startDate endDate")
    .populate("createdBy", "firstName lastName email role")
    .sort({ price: 1 }); // Sort by price (cheapest first)

  if (!tickets || tickets.length === 0) {
    return res.status(404).json({
      message: "No tickets found for this event",
    });
  }

  res.json(tickets);
});

// ❌ REMOVED: updateTicket function for organizers - Now ADMIN ONLY
// Update ticket (ADMIN ONLY - organizers cannot update tickets anymore)
export const updateTicket = asyncHandler(async (req, res) => {
  const {
    type,
    price,
    quantity,
    availableQuantity,
    description,
    features,
    saleEndDate,
    status,
  } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // ❌ RESTRICTION: Only admin can update tickets now
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Only admin can update tickets.");
  }

  // Optional updates
  if (type) ticket.type = type;
  if (price) ticket.price = price;
  if (quantity) ticket.quantity = quantity;
  if (availableQuantity !== undefined)
    ticket.availableQuantity = availableQuantity;
  if (description) ticket.description = description;
  if (features) ticket.features = features;
  if (saleEndDate) ticket.saleEndDate = saleEndDate;
  if (status) ticket.status = status;

  await ticket.save();
  res.json(ticket);
});

// ❌ REMOVED: deleteTicket function for organizers - Now ADMIN ONLY
// Delete ticket (ADMIN ONLY - organizers cannot delete tickets anymore)
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // ❌ RESTRICTION: Only admin can delete tickets now
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Only admin can delete tickets.");
  }

  await ticket.deleteOne();
  res.json({ message: "Ticket deleted successfully" });
});

// ==================================================
// دوال التحقق من التذاكر عبر QR Code
// ==================================================

import Booking from "../models/Booking.js";
import QRCodeService from "../services/qrCodeService.js";

/**
 * التحقق من صحة التذكرة عبر QR Code
 */
export const verifyTicket = asyncHandler(async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز التذكرة مطلوب",
      });
    }

    // فك تشفير والتحقق من التذكرة
    const verification = await QRCodeService.verifyTicket(token);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error,
      });
    }

    const { ticketData } = verification;

    // التحقق من وجود الحجز في قاعدة البيانات
    const booking = await Booking.findById(ticketData.bookingId)
      .populate("event", "title startDate endDate location category")
      .populate("ticket", "type price currency")
      .populate("user", "userName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود في النظام",
      });
    }

    // التأكد من أن الحجز مُأكد ومدفوع
    if (
      booking.status !== "confirmed" ||
      booking.paymentStatus !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "التذكرة غير صالحة - الحجز غير مُأكد أو غير مدفوع",
        booking: {
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        },
      });
    }

    // التحقق من أن التذكرة لم يتم استخدامها من قبل
    if (booking.checkedIn) {
      return res.status(400).json({
        success: false,
        message: "تم استخدام هذه التذكرة من قبل",
        checkedInAt: booking.checkedInAt,
      });
    }

    // التحقق من توقيت الحدث
    const eventStartTime = new Date(booking.event.startDate);
    const currentTime = new Date();
    const timeDiff = eventStartTime.getTime() - currentTime.getTime();
    const hoursUntilEvent = timeDiff / (1000 * 60 * 60);

    if (hoursUntilEvent > 24) {
      return res.status(400).json({
        success: false,
        message: "التذكرة غير صالحة بعد - الحدث لم يبدأ",
        eventStartTime: booking.event.startDate,
      });
    }

    if (hoursUntilEvent < -24) {
      return res.status(400).json({
        success: false,
        message: "التذكرة منتهية الصلاحية - انتهى الحدث",
        eventEndTime: booking.event.endDate,
      });
    }

    return res.status(200).json({
      success: true,
      message: "التذكرة صحيحة وصالحة للاستخدام",
      ticket: {
        bookingCode: booking.bookingCode,
        attendeeName: booking.attendeeInfo.name,
        attendeeEmail: booking.attendeeInfo.email,
        eventTitle: booking.event.title,
        eventDate: booking.event.startDate,
        eventLocation: booking.event.location,
        ticketType: booking.ticket.type,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        currency: booking.ticket.currency,
      },
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        checkedIn: booking.checkedIn,
      },
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في التحقق من التذكرة",
      error: error.message,
    });
  }
});

/**
 * تسجيل دخول حامل التذكرة (Check-in)
 */
export const checkInTicket = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const organizerId = req.user._id; // المنظم الذي يقوم بالتسجيل

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "رمز التذكرة مطلوب",
      });
    }

    // التحقق من صحة التذكرة أولاً
    const verification = await QRCodeService.verifyTicket(token);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error,
      });
    }

    const { ticketData } = verification;

    // العثور على الحجز
    const booking = await Booking.findById(ticketData.bookingId)
      .populate("event", "title startDate organizer")
      .populate("user", "userName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // التأكد من أن المنظم مخول لتسجيل الدخول لهذا الحدث
    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "غير مخول لتسجيل الدخول لهذا الحدث",
      });
    }

    // التأكد من أن الحجز مُأكد ومدفوع
    if (
      booking.status !== "confirmed" ||
      booking.paymentStatus !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "التذكرة غير صالحة للاستخدام",
      });
    }

    // التأكد من عدم تسجيل الدخول من قبل
    if (booking.checkedIn) {
      return res.status(400).json({
        success: false,
        message: "تم تسجيل الدخول للتذكرة من قبل",
        checkedInAt: booking.checkedInAt,
      });
    }

    // تسجيل الدخول
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      checkedIn: {
        bookingCode: booking.bookingCode,
        attendeeName: booking.attendeeInfo.name,
        checkedInAt: booking.checkedInAt,
        eventTitle: booking.event.title,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في تسجيل الدخول",
      error: error.message,
    });
  }
});

/**
 * الحصول على إحصائيات التذاكر للمنظم
 */
export const getTicketStats = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    // التأكد من أن المنظم مخول لرؤية إحصائيات هذا الحدث
    const event = await Event.findOne({ _id: eventId, organizer: organizerId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "الحدث غير موجود أو غير مخول",
      });
    }

    // جمع الإحصائيات
    const [
      totalBookings,
      confirmedBookings,
      checkedInBookings,
      totalRevenue,
      ticketTypes,
    ] = await Promise.all([
      Booking.countDocuments({ event: eventId }),
      Booking.countDocuments({
        event: eventId,
        status: "confirmed",
        paymentStatus: "completed",
      }),
      Booking.countDocuments({
        event: eventId,
        checkedIn: true,
      }),
      Booking.aggregate([
        {
          $match: {
            event: mongoose.Types.ObjectId(eventId),
            paymentStatus: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            event: mongoose.Types.ObjectId(eventId),
            status: "confirmed",
            paymentStatus: "completed",
          },
        },
        {
          $lookup: {
            from: "tickets",
            localField: "ticket",
            foreignField: "_id",
            as: "ticketInfo",
          },
        },
        { $unwind: "$ticketInfo" },
        {
          $group: {
            _id: "$ticketInfo.type",
            count: { $sum: "$quantity" },
            revenue: { $sum: "$totalPrice" },
          },
        },
      ]),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    return res.status(200).json({
      success: true,
      stats: {
        event: {
          title: event.title,
          startDate: event.startDate,
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          checkedIn: checkedInBookings,
          checkInRate:
            confirmedBookings > 0
              ? ((checkedInBookings / confirmedBookings) * 100).toFixed(2)
              : 0,
        },
        revenue: {
          total: revenue,
          currency: "EGP", // أو من إعدادات الحدث
        },
        ticketTypes: ticketTypes.map((type) => ({
          type: type._id,
          soldCount: type.count,
          revenue: type.revenue,
        })),
      },
    });
  } catch (error) {
    console.error("Get ticket stats error:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الإحصائيات",
      error: error.message,
    });
  }
});