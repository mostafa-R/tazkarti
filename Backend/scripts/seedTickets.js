// scripts/seedTickets.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Event } from "../src/models/Event.js";
import { Ticket } from "../src/models/Ticket.js";


dotenv.config();

const seedTickets = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 2. Get all events
    const events = await Event.find();
    console.log(`Found ${events.length} events`);

    // 3. Loop through events and create tickets
    for (let event of events) {
      const ticketTypes = [
        {
          type: "standard",
          price: 100,
          quantity: 200,
          availableQuantity: 200,
          description: "Standard entry ticket",
          saleEndDate: new Date("2025-12-31"),
          createdBy: event.organizer
        },
        {
          type: "vip",
          price: 250,
          quantity: 50,
          availableQuantity: 50,
          description: "VIP ticket with perks",
          saleEndDate: new Date("2025-12-31"),
          createdBy: event.organizer
        }
      ];

      for (let t of ticketTypes) {
        await Ticket.create({ ...t, event: event._id });
      }
    }

    console.log("Tickets added successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding tickets", error);
    process.exit(1);
  }
};

seedTickets();
