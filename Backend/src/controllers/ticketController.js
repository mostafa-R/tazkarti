import asyncHandler from "express-async-handler";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";

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
    isActive: true 
  })
    .populate("event", "title startDate endDate")
    .populate("createdBy", "firstName lastName email role")
    .sort({ price: 1 }); // Sort by price (cheapest first)

  if (!tickets || tickets.length === 0) {
    return res.status(404).json({ 
      message: "No tickets found for this event" 
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
