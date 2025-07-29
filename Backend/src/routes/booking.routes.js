import express from "express";
import { bookingTicketWithPayment } from "../controllers/booking.controller.js";
import {
  cancelExpiredBookings,
  checkPaymentStatus,
  handlePayMobWebhook,
} from "../controllers/paymob.controller.js";


const router = express.Router();

// إنشاء حجز جديد مع الدفع
router.post("/book-ticket", bookingTicketWithPayment);

// Webhook من PayMob
router.post("/paymob-webhook", handlePayMobWebhook);

// التحقق من حالة الدفع
router.get("/payment-status/:bookingId", checkPaymentStatus);

// إعداد Cron Job لإلغاء الحجوزات المنتهية الصلاحية
// يتم تشغيله كل 5 دقائق
setInterval(cancelExpiredBookings, 5 * 60 * 1000);

export default router;
