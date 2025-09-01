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
router.get("/event/:eventId", getTicketsByEvent); // ✅ Get tickets for specific event
router.get("/:id", getTicketById); // ✅ Get specific ticket details

// ====== Ticket Verification Routes (Public - unchanged) ======
router.get("/verify", verifyTicket); // التحقق من صحة التذكرة عبر QR Code

// ====== Organizer Routes ======
// ✅ ALLOWED: Organizers can CREATE tickets
router.post("/", roleMiddleware(["organizer", "admin"]), createTicket);

// ❌ RESTRICTED: UPDATE tickets - ADMIN ONLY now (organizers blocked)
router.put("/:id", roleMiddleware(["admin"]), updateTicket); // ❌ Removed "organizer" - ADMIN ONLY

// ❌ RESTRICTED: DELETE tickets - ADMIN ONLY now (organizers blocked)
router.delete("/:id", roleMiddleware(["admin"]), deleteTicket); // ❌ Removed "organizer" - ADMIN ONLY

// ====== Organizer Check-in & Stats Routes (unchanged) ======
router.post("/check-in", roleMiddleware(["organizer"]), checkInTicket); // تسجيل دخول التذكرة
router.get("/stats/:eventId", roleMiddleware(["organizer"]), getTicketStats); // إحصائيات التذاكر للحدث

export default router;