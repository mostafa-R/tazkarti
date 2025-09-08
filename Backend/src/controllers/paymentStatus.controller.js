import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import logger from '../utils/logger.js';
import { PaymentService, WebhookService } from './checkout.controller.js';

/**
 * Enhanced payment status controller to handle all payment states
 * and provide comprehensive verification
 */

/**
 * الحصول على حالة الدفع التفصيلية للحجز
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user?._id;

    logger.debug(`Getting payment status for reference: ${reference}`);

    // العثور على الحجز
    const booking = await Booking.findOne({
      bookingCode: reference,
      ...(userId && { user: userId })
    })
    .populate('event', 'title startDate location')
    .populate('ticket', 'type price currency')
    .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // العثور على سجل الدفع
    const payment = await Payment.findOne({ booking: booking._id }).lean();

    // تحديد الحالة الحالية
    const getStatusInfo = () => {
      if (booking.paymentStatus === 'completed' && booking.status === 'confirmed') {
        return {
          status: 'completed',
          message: 'تم الدفع بنجاح وتأكيد الحجز',
          canRetry: false,
          canCancel: false,
        };
      }

      if (booking.paymentStatus === 'failed' || booking.status === 'cancelled') {
        return {
          status: 'failed',
          message: payment?.gatewayResponse?.responseMessage || 'فشل الدفع',
          canRetry: true,
          canCancel: false,
        };
      }

      if (booking.paymentStatus === 'pending' || booking.status === 'pending') {
        // التحقق من انتهاء صلاحية الجلسة (أكثر من 30 دقيقة)
        const bookingAge = Date.now() - new Date(booking.createdAt).getTime();
        if (bookingAge > 30 * 60 * 1000) {
          return {
            status: 'expired',
            message: 'انتهت صلاحية جلسة الدفع',
            canRetry: true,
            canCancel: false,
          };
        }

        return {
          status: 'pending',
          message: 'جاري معالجة الدفع',
          canRetry: false,
          canCancel: true,
        };
      }

      return {
        status: 'pending',
        message: 'حالة الدفع غير معروفة',
        canRetry: true,
        canCancel: true,
      };
    };

    const statusInfo = getStatusInfo();

    const response = {
      success: true,
      data: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        status: statusInfo.status,
        message: statusInfo.message,
        canRetry: statusInfo.canRetry,
        canCancel: statusInfo.canCancel,
        qrCode: booking.qrCode,
        event: booking.event,
        ticket: booking.ticket,
        totalPrice: booking.totalPrice,
        quantity: booking.quantity,
        createdAt: booking.createdAt,
        paymentDate: booking.paymentDate,
        attendeeInfo: booking.attendeeInfo,
      }
    };

    // تضمين تفاصيل الدفع إذا كانت متاحة
    if (payment) {
      response.data.payment = {
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        capturedAt: payment.capturedAt,
        failedAt: payment.failedAt,
        gatewayResponse: payment.gatewayResponse,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error('[getPaymentStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب حالة الدفع',
      error: error.message,
    });
  }
};

/**
 * التحقق القسري من الدفع مع بوابة الدفع
 */
export const forcePaymentVerification = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user?._id;

    logger.debug(`Force verifying payment for reference: ${reference}`);

    // العثور على الحجز
    const booking = await Booking.findOne({
      bookingCode: reference,
      ...(userId && { user: userId })
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // تخطي إذا كان مكتملاً بالفعل
    if (booking.paymentStatus === 'completed' && booking.status === 'confirmed') {
      return res.status(200).json({
        success: true,
        message: "الدفع مكتمل بالفعل",
        data: {
          bookingStatus: booking.status,
          paymentStatus: booking.paymentStatus,
          verified: false,
          alreadyCompleted: true,
        }
      });
    }

    let updated = false;
    let gatewayStatus = null;

    // محاولة الحصول على تفاصيل الدفع من البوابة إذا كان لدينا paymentOrderId
    if (booking.paymentOrderId) {
      try {
        const paymentDetails = await PaymentService.getPaymentDetails(booking.paymentOrderId);

        if (paymentDetails) {
          gatewayStatus = paymentDetails.status?.toLowerCase();
          logger.info(`Gateway status for ${booking.paymentOrderId}: ${gatewayStatus}`);

          // المعالجة بناءً على حالة البوابة
          if (['captured', 'paid', 'authorized'].includes(gatewayStatus)) {
            await WebhookService.handleSuccessfulPayment(paymentDetails);
            updated = true;
            logger.info(`Updated successful payment for booking ${booking._id}`);
          } else if (['declined', 'failed', 'cancelled'].includes(gatewayStatus)) {
            await WebhookService.handleFailedPayment(paymentDetails);
            updated = true;
            logger.info(`Updated failed payment for booking ${booking._id}`);
          }
        }
      } catch (gatewayError) {
        logger.error('Gateway verification error:', gatewayError);
      }
    }

    // الحصول على بيانات الحجز المحدثة
    const updatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title startDate')
      .lean();

    res.status(200).json({
      success: true,
      message: updated ? "تم تحديث حالة الدفع من البوابة" : "لا حاجة للتحديث",
      data: {
        bookingId: updatedBooking._id,
        bookingCode: updatedBooking.bookingCode,
        bookingStatus: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        gatewayStatus,
        verified: true,
        updated,
        qrCode: updatedBooking.qrCode,
      }
    });

  } catch (error) {
    logger.error('[forcePaymentVerification] Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في التحقق من الدفع',
      error: error.message,
    });
  }
};

/**
 * إلغاء دفعة معلقة
 */
export const cancelPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user?._id;

    logger.debug(`Cancelling payment for reference: ${reference}`);

    const booking = await Booking.findOne({
      bookingCode: reference,
      ...(userId && { user: userId })
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // السماح بالإلغاء للدفعات المعلقة فقط
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إلغاء الدفع المكتمل",
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(200).json({
        success: true,
        message: "الدفع ملغى بالفعل",
        data: {
          bookingStatus: booking.status,
          paymentStatus: booking.paymentStatus,
        }
      });
    }

    // تحديث الحجز إلى ملغى
    booking.status = 'cancelled';
    booking.paymentStatus = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // إنشاء/تحديث سجل الدفع
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        booking: booking._id,
        user: booking.user,
        status: 'cancelled',
        failedAt: new Date(),
        gatewayResponse: {
          responseCode: 'CANCELLED',
          responseMessage: 'تم إلغاء الدفع من قبل المستخدم',
        }
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "تم إلغاء الدفع بنجاح",
      data: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        cancelledAt: booking.cancelledAt,
      }
    });

  } catch (error) {
    logger.error('[cancelPayment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إلغاء الدفع',
      error: error.message,
    });
  }
};

/**
 * إعادة محاولة دفع فاشل
 */
export const retryPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user?._id;

    logger.debug(`Retrying payment for reference: ${reference}`);

    const booking = await Booking.findOne({
      bookingCode: reference,
      ...(userId && { user: userId })
    }).populate('ticket', 'currency');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // السماح بإعادة المحاولة للدفعات الفاشلة/الملغاة/المنتهية الصلاحية فقط
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إعادة محاولة الدفع المكتمل",
      });
    }

    if (booking.paymentStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: "الدفع لا يزال معلقاً، لا يمكن إعادة المحاولة بعد",
      });
    }

    // إعادة تعيين حالة الحجز لإعادة المحاولة
    booking.status = 'pending';
    booking.paymentStatus = 'pending';
    booking.paymentDate = null;
    booking.retryCount = (booking.retryCount || 0) + 1;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين الدفع لإعادة المحاولة",
      data: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        retryCount: booking.retryCount,
        totalPrice: booking.totalPrice,
        currency: booking.ticket?.currency || 'EGP',
      }
    });

  } catch (error) {
    logger.error('[retryPayment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إعادة محاولة الدفع',
      error: error.message,
    });
  }
};

/**
 * الحصول على تحليلات الدفع (للمشرفين)
 */
export const getPaymentAnalytics = async (req, res) => {
  try {
    // التحقق من صلاحية المشرف
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "مطلوب صلاحية المشرف",
      });
    }

    const [bookingStatuses, paymentStatuses, pendingOld, failedLast24h, successfulLast24h] = await Promise.all([
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
      Booking.countDocuments({
        paymentStatus: 'pending',
        createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) }
      }),
      Booking.countDocuments({
        paymentStatus: 'failed',
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Booking.countDocuments({
        paymentStatus: 'completed',
        status: 'confirmed',
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingStatuses,
        paymentStatuses,
        pendingOldPayments: pendingOld,
        failedLast24h,
        successfulLast24h,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    logger.error('[getPaymentAnalytics] Error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تحليلات الدفع',
      error: error.message,
    });
  }
};

