import express from 'express';
import {
  cancelPayment,
  forcePaymentVerification,
  getPaymentAnalytics,
  getPaymentStatus,
  retryPayment
} from '../controllers/paymentStatus.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// الحصول على حالة الدفع التفصيلية للحجز
router.get('/:reference', authMiddleware, getPaymentStatus);

// التحقق القسري من الدفع مع بوابة الدفع
router.post('/:reference/verify', authMiddleware, forcePaymentVerification);

// إلغاء دفعة معلقة
router.post('/:reference/cancel', authMiddleware, cancelPayment);

// إعادة محاولة دفع فاشل
router.post('/:reference/retry', authMiddleware, retryPayment);

// الحصول على تحليلات الدفع (للمشرفين فقط)
router.get('/admin/analytics', authMiddleware, getPaymentAnalytics);

export default router;
