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
} from "../controllers/booking.controller.js";
import {
  downloadTicket,
  getTicketDetails
} from "../controllers/bookingTicket.js";
import {
  cancelPayment,
  checkoutHealthCheck,
  checkoutWebhook,
  createPaymentLink,
  getPaymentDetails,
  payWithToken,
  retryPayment,
  verifyPaymentStatus,
  verifyPaymentWithGateway,
  verifyPendingBookingsWithGateway,
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

// الحصول على تفاصيل التذكرة
router.get("/ticket/:bookingId", authenticateToken, getTicketDetails);

// تنزيل التذكرة
router.get("/ticket/:bookingId/download", authenticateToken, downloadTicket);

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

// Payment status
router.get('/verify/:reference', authenticateToken, verifyPaymentStatus);
router.post('/retry/:bookingId', authenticateToken, paymentRateLimit, retryPayment);
router.post('/cancel/:bookingId', authenticateToken, cancelPayment);

// Health check
router.get('/health',checkoutHealthCheck);

// ====== Payment Gateway Verification Routes ======
// التحقق من حالة الدفع مع بوابة الدفع مباشرة (للمشرفين والمنظمين)
router.get(
  '/verify-payment-gateway/:paymentId',
  authenticateToken,
  requireRole(["admin", "organizer"]),
  verifyPaymentWithGateway
);

router.get(
  '/verify-payment-gateway/:paymentId/:bookingId',
  authenticateToken,
  requireRole(["admin", "organizer"]),
  verifyPaymentWithGateway
);

// التحقق من جميع الحجوزات المعلقة مع بوابة الدفع (للمشرفين فقط)
router.post(
  '/verify-pending-bookings',
  authenticateToken,
  requireRole(["admin"]),
  verifyPendingBookingsWithGateway
);

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

export default router;
