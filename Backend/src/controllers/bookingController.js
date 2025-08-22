import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import User from "../models/User.js";

// Get all bookings for organizer's events
export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

    // Find all events created by this organizer
    const organizerEvents = await Event.find({ organizer: organizerId }).select('_id');
    const eventIds = organizerEvents.map(event => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        bookings: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalBookings: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Build query filters
    let query = { event: { $in: eventIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'attendeeInfo.name': { $regex: search, $options: 'i' } },
        { 'attendeeInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    // Get bookings with populated data
    const bookings = await Booking.find(query)
      .populate({
        path: 'event',
        select: 'title startDate endDate location category images'
      })
      .populate({
        path: 'user',
        select: 'userName email phone'
      })
      .populate({
        path: 'ticket',
        select: 'type price currency'
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
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get organizer bookings error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};

// Get booking details by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const organizerId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'event',
        select: 'title description startDate endDate time location category images organizer maxAttendees'
      })
      .populate({
        path: 'user',
        select: 'userName email phone createdAt'
      })
      .populate({
        path: 'ticket',
        select: 'type price currency description features'
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the booking belongs to organizer's event
    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ booking });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch booking details', 
      error: error.message 
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const organizerId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: pending, confirmed, or cancelled' 
      });
    }

    const booking = await Booking.findById(bookingId).populate('event');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the booking belongs to organizer's event
    if (booking.event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update booking status
    booking.status = status;
    
    // If cancelling, also update payment status
    if (status === 'cancelled') {
      booking.paymentStatus = 'failed';
    }

    await booking.save();

    res.status(200).json({ 
      message: `Booking ${status} successfully`,
      booking 
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      message: 'Failed to update booking status', 
      error: error.message 
    });
  }
};

// Get booking statistics for organizer
export const getBookingStats = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { eventId, startDate, endDate } = req.query;

    // Find organizer's events
    let eventQuery = { organizer: organizerId };
    if (eventId) {
      eventQuery._id = eventId;
    }

    const organizerEvents = await Event.find(eventQuery).select('_id');
    const eventIds = organizerEvents.map(event => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        recentBookings: []
      });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get booking statistics
    const bookingQuery = { event: { $in: eventIds }, ...dateFilter };

    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      Booking.countDocuments(bookingQuery),
      Booking.countDocuments({ ...bookingQuery, status: 'confirmed' }),
      Booking.countDocuments({ ...bookingQuery, status: 'pending' }),
      Booking.countDocuments({ ...bookingQuery, status: 'cancelled' }),
      Booking.aggregate([
        { $match: { ...bookingQuery, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.find(bookingQuery)
        .populate('event', 'title startDate')
        .populate('user', 'userName email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      recentBookings
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch booking statistics', 
      error: error.message 
    });
  }
};

// Get bookings for a specific event
export const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Verify event belongs to organizer
    const event = await Event.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }

    // Build query
    let query = { event: eventId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('user', 'userName email phone')
      .populate('ticket', 'type price currency')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      event: {
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBookings,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch event bookings', 
      error: error.message 
    });
  }
};
