import express from "express";
import {
  checkInTicket,
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  getTicketsByEvent,
  getTicketStats,
  updateTicket,
  verifyTicket,
} from "../controllers/ticketController.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ====== Public Routes (unchanged) ======
router.get("/", getTickets);
router.get("/event/:eventId", getTicketsByEvent);
router.get("/:id", getTicketById);

// ====== Ticket Verification Routes (Public - unchanged) ======
router.get("/verify", verifyTicket);

// ====== Organizer Routes ======

router.post("/", roleMiddleware(["organizer", "admin"]), createTicket);

router.put("/:id", roleMiddleware(["admin"]), updateTicket);

router.delete("/:id", roleMiddleware(["admin"]), deleteTicket);

// ====== Organizer Check-in & Stats Routes (unchanged) ======
router.post("/check-in", roleMiddleware(["organizer"]), checkInTicket);
router.get("/stats/:eventId", roleMiddleware(["organizer"]), getTicketStats)
export default router;
