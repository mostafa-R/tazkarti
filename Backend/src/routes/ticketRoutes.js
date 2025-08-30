import express from "express";
import {
  checkInTicket,
  createTicket,
  getTicketById,
  getTickets,
  getTicketsByEvent,
  getTicketStats,
  verifyTicket,
} from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ====== Public Routes ======
router.get("/", getTickets);
router.get("/event/:eventId", getTicketsByEvent); // Get tickets for specific event
router.get("/:id", getTicketById);

// ====== Ticket Verification Routes (Public) ======
router.get("/verify", verifyTicket); // التحقق من صحة التذكرة عبر QR Code

// ====== Organizer Routes ======
router.post("/", authMiddleware, roleMiddleware(["organizer"]), createTicket);

// ====== Organizer Check-in & Stats Routes ======
router.post("/check-in", authMiddleware, roleMiddleware(["organizer"]), checkInTicket); // تسجيل دخول التذكرة
router.get("/stats/:eventId", authMiddleware, roleMiddleware(["organizer"]), getTicketStats); // إحصائيات التذاكر للحدث

export default router;
