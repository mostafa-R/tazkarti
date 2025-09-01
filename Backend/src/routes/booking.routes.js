import express from "express";

import {
  bookingTicket,
  cancelPendingBooking,
  createBookingWithSecurePayment,
  getBookingById,
  getBookingStats,
  getBookingStatus,
  getEventBookings,
  getOrganizerBookings,
  getUserBookings,
  updateBookingStatus,
  getDetailedBookings,
  getAdvancedBookingAnalytics,
  exportBookings,
} from "../controllers/booking.controller.js";
import {
  checkoutWebhook,
  createPaymentLink,
  getPaymentDetails,
  payWithToken,
} from "../controllers/checkout.controller.js";
import { authMiddleware as authenticateToken } from "../middleware/authMiddleware.js";
import {
  cacheOrganizerBookings,
  paymentRateLimit,
} from "../middleware/performanceMiddleware.js";
import { roleMiddleware as requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ====== Customer Booking Routes (New Secure Flow) ======
// إنشاء حجز آمن مع الدفع
router.post(
  "/create-secure-booking",
  authenticateToken,
  createBookingWithSecurePayment
);

// إلغاء الحجز المؤقت
router.delete(
  "/cancel-pending/:bookingId",
  authenticateToken,
  cancelPendingBooking
);

// التحقق من حالة الحجز
router.get("/status/:bookingId", authenticateToken, getBookingStatus);

// الحصول على جميع حجوزات المستخدم
router.get("/my-bookings", authenticateToken, getUserBookings);

// Legacy booking route (للتوافق مع الكود القديم)
router.post("/book-ticket", authenticateToken, bookingTicket);

// 1) دفع بكارت عبر Frames Token
router.post("/checkout/pay-with-token", paymentRateLimit, payWithToken);

// 2) إنشاء Hosted Payment Link (Redirect)
router.post("/checkout/payment-link", paymentRateLimit, createPaymentLink);

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
  cacheOrganizerBookings, // Cache للحجوزات
  getOrganizerBookings
);
router.get(
  "/organizer/bookings/stats",
  authenticateToken,
  requireRole(["organizer"]),
  cacheOrganizerBookings, // Cache للإحصائيات
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

// Enhanced booking management routes
router.get(
  "/organizer/bookings/detailed",
  authenticateToken,
  requireRole(["organizer"]),
  getDetailedBookings
);
router.get(
  "/organizer/bookings/analytics",
  authenticateToken,
  requireRole(["organizer"]),
  getAdvancedBookingAnalytics
);
router.get(
  "/organizer/bookings/export",
  authenticateToken,
  requireRole(["organizer"]),
  exportBookings
);

// إعداد Cron Job لإلغاء الحجوزات المنتهية الصلاحية
// يتم تشغيله كل 5 دقائق
// setInterval(cancelExpiredBookings, 5 * 60 * 1000);

export default router;
