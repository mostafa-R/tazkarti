import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  getTicketsByEvent,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getTickets);
router.get("/event/:eventId", getTicketsByEvent); // NEW: Get tickets for specific event
router.get("/:id", getTicketById);

//  Organizer 
router.post("/", roleMiddleware(["organizer"]), createTicket);
router.put("/:id", roleMiddleware(["organizer"]), updateTicket);
router.delete("/:id", roleMiddleware(["organizer"]), deleteTicket);

export default router;
