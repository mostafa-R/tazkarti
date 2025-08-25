import express from "express";
// import { bookingTicketWithPayment } from "../controllers/booking.controller.js";

import {
  getBookingById,
  getBookingStats,
  getEventBookings,
  getOrganizerBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import {
  checkoutWebhook,
  createPaymentLink,
  getPaymentDetails,
  payWithToken,
} from "../controllers/checkout.controller.js";
import { authMiddleware as authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware as requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Customer booking routes
// router.post("/book-ticket", authenticateToken, bookingTicketWithPayment);

// 1) دفع بكارت عبر Frames Token
router.post("/checkout/pay-with-token", payWithToken);

// 2) إنشاء Hosted Payment Link (Redirect)
router.post("/checkout/payment-link", createPaymentLink);

// 3) الاستعلام عن دفعة
router.get("/checkout/:paymentId", getPaymentDetails);

// 4) Webhook (لازم raw body في server.js)
router.post("/checkout/webhook", checkoutWebhook);

// router.get("/payment-status/:bookingId", authenticateToken, checkPaymentStatus);

// Organizer booking management routes
router.get(
  "/organizer/bookings",
  authenticateToken,
  requireRole(["organizer"]),
  getOrganizerBookings
);
router.get(
  "/organizer/bookings/stats",
  authenticateToken,
  requireRole(["organizer"]),
  getBookingStats
);
router.get(
  "/organizer/bookings/:bookingId",
  authenticateToken,
  requireRole(["organizer"]),
  getBookingById
);
router.put(
  "/organizer/bookings/:bookingId/status",
  authenticateToken,
  requireRole(["organizer"]),
  updateBookingStatus
);
router.get(
  "/organizer/events/:eventId/bookings",
  authenticateToken,
  requireRole(["organizer"]),
  getEventBookings
);

// إعداد Cron Job لإلغاء الحجوزات المنتهية الصلاحية
// يتم تشغيله كل 5 دقائق
// setInterval(cancelExpiredBookings, 5 * 60 * 1000);

export default router;
