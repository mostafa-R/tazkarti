import asyncHandler from "express-async-handler";
import { Ticket } from "../models/Ticket.js";

// Admin بس
export const createTicket = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const ticket = await Ticket.create({
    title,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json(ticket);
});

// Admin أو User
export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find().populate("createdBy", "name email role");
  res.json(tickets);
});


export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("createdBy", "name email role");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  res.json(ticket);
});

// Admin بس
export const updateTicket = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.title = title || ticket.title;
  ticket.description = description || ticket.description;
  ticket.status = status || ticket.status;

  await ticket.save();

  res.json(ticket);
});

// Admin بس
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  await ticket.deleteOne();

  res.json({ message: " deleted successfully" });
});
