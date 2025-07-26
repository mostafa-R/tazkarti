import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
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
