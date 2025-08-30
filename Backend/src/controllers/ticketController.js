import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";

export const createTicket = asyncHandler(async (req, res) => {
  try {
    // Log everything for debugging
    console.log('=== TICKET CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');

    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { eventId, type, price, quantity, description, features } = req.body;

    // Basic validation
    if (!eventId || !type || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: eventId, type, price, quantity"
      });
    }

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check event ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only add tickets to your own events"
      });
    }

    // Validate ticket type
    const validTypes = ["Standard", "VIP", "Premium", "Early Bird", "Student"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ticket type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Create ticket with all required fields
    const ticketData = {
      event: eventId,
      type: type,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      availableQuantity: parseInt(quantity),
      createdBy: req.user._id,
      description: description || '',
      features: Array.isArray(features) ? features : [],
      ticketCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
      currency: "EGP",
      saleStartDate: new Date(),
      saleEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: "active"
    };

    console.log('Creating ticket with data:', ticketData);

    // Validate the ticket data before creating
    const ticketInstance = new Ticket(ticketData);
    const validationError = ticketInstance.validateSync();
    
    if (validationError) {
      console.error('=== VALIDATION ERROR BEFORE CREATE ===');
      console.error('Validation errors:', validationError.errors);
      const validationMessages = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationMessages
      });
    }

    console.log('Validation passed, creating ticket...');
    const ticket = await Ticket.create(ticketData);
    console.log('Ticket created successfully:', ticket._id);

    // Update event
    await Event.findByIdAndUpdate(
      eventId,
      { $push: { tickets: ticket._id } }
    );

    res.status(201).json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('=== TICKET CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationMessages
      });
    }

    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: "Duplicate ticket code. Please try again."
      });
    }

    console.error('Full error:', error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find()
    .populate("event", "title date")
    .populate("createdBy", "name email role");

  res.json(tickets);
});

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

// NEW: Get tickets for a specific event
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

//  Organizer
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

//  Organizer
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
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
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في التحقق من التذكرة",
      error: error.message,
      validationErrors: error.errors || null
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
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في تسجيل الدخول",
      error: error.message,
      validationErrors: error.errors || null
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
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الإحصائيات",
      error: error.message,
      validationErrors: error.errors || null
    });
  }
});
