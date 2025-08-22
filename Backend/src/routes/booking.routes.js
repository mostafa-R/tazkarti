import express from "express";
import { bookingTicketWithPayment } from "../controllers/booking.controller.js";
import {
  cancelExpiredBookings,
  checkPaymentStatus,
  handlePayMobWebhook,
} from "../controllers/paymob.controller.js";
import {
  getOrganizerBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats,
  getEventBookings
} from "../controllers/bookingController.js";
import { authMiddleware as authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware as requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Customer booking routes
router.post("/book-ticket", authenticateToken, bookingTicketWithPayment);
router.post("/paymob-webhook", handlePayMobWebhook);
router.get("/payment-status/:bookingId", authenticateToken, checkPaymentStatus);

// Organizer booking management routes
router.get("/organizer/bookings", authenticateToken, requireRole(['organizer']), getOrganizerBookings);
router.get("/organizer/bookings/stats", authenticateToken, requireRole(['organizer']), getBookingStats);
router.get("/organizer/bookings/:bookingId", authenticateToken, requireRole(['organizer']), getBookingById);
router.put("/organizer/bookings/:bookingId/status", authenticateToken, requireRole(['organizer']), updateBookingStatus);
router.get("/organizer/events/:eventId/bookings", authenticateToken, requireRole(['organizer']), getEventBookings);

// إعداد Cron Job لإلغاء الحجوزات المنتهية الصلاحية
// يتم تشغيله كل 5 دقائق
setInterval(cancelExpiredBookings, 5 * 60 * 1000);

export default router;
