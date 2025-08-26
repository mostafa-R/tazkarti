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

// ====== Public Routes ======
router.get("/", getTickets);
router.get("/event/:eventId", getTicketsByEvent); // Get tickets for specific event
router.get("/:id", getTicketById);

// ====== Ticket Verification Routes (Public) ======
router.get("/verify", verifyTicket); // التحقق من صحة التذكرة عبر QR Code

// ====== Organizer Routes ======
router.post("/", roleMiddleware(["organizer"]), createTicket);
router.put("/:id", roleMiddleware(["organizer"]), updateTicket);
router.delete("/:id", roleMiddleware(["organizer"]), deleteTicket);

// ====== Organizer Check-in & Stats Routes ======
router.post("/check-in", roleMiddleware(["organizer"]), checkInTicket); // تسجيل دخول التذكرة
router.get("/stats/:eventId", roleMiddleware(["organizer"]), getTicketStats); // إحصائيات التذاكر للحدث

export default router;
