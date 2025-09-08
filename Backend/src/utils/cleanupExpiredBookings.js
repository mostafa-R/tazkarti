import mongoose from "mongoose";
import cron from "node-cron";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import User from "../models/User.js";


export const cleanupExpiredBookings = async () => {
  const session = await mongoose.startSession();

  try {
    console.log("[Cleanup] Starting expired bookings cleanup...");

    // تحديد المدة المسموحة للحجز المؤقت (15 دقيقة)
    const expirationTime = 15 * 60 * 1000; // 15 دقيقة بالملي ثانية
    const expiredThreshold = new Date(Date.now() - expirationTime);

    // البحث عن الحجوزات المعلقة المنتهية الصلاحية
    const expiredBookings = await Booking.find({
      status: "pending",
      paymentStatus: { $in: ["pending", "processing"] },
      createdAt: { $lt: expiredThreshold },
    }).populate("ticket");

    if (expiredBookings.length === 0) {
      console.log("[Cleanup] No expired bookings found");
      return;
    }

    console.log(
      `[Cleanup] Found ${expiredBookings.length} expired bookings to clean up`
    );

    // Start a single transaction for all bookings
    session.startTransaction();

    try {
      // Group bookings by ticket to aggregate quantity updates
      const ticketUpdates = new Map();
      const userUpdates = new Map();
      const bookingIds = [];
      const paymentUpdates = [];

      // First pass: collect all updates
      for (const booking of expiredBookings) {
        console.log(`[Cleanup] Processing expired booking: ${booking._id}`);

        bookingIds.push(booking._id);

        // Aggregate ticket quantity updates
        if (booking.ticket && booking.ticket._id) {
          const ticketId = booking.ticket._id.toString();
          const currentQuantity = ticketUpdates.get(ticketId) || 0;
          ticketUpdates.set(ticketId, currentQuantity + booking.quantity);
        }

        // Aggregate user updates (remove booking from user's ticketsBooked)
        if (booking.user) {
          const userId = booking.user.toString();
          if (!userUpdates.has(userId)) {
            userUpdates.set(userId, []);
          }
          userUpdates.get(userId).push(booking._id);
        }

        // Collect payment updates
        const payment = await Payment.findOne({ booking: booking._id }).session(session);
        if (payment) {
          paymentUpdates.push({
            _id: payment._id,
            status: "expired",
            expiredAt: new Date(),
          });
        }
      }

      // Bulk update all bookings
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        {
          status: "cancelled",
          paymentStatus: "expired"
        },
        { session }
      );

      // Update tickets with aggregated quantities
      const ticketUpdatePromises = [];
      for (const [ticketId, totalQuantityToReturn] of ticketUpdates) {
        ticketUpdatePromises.push(
          Ticket.findByIdAndUpdate(
            ticketId,
            { $inc: { availableQuantity: totalQuantityToReturn } },
            { session }
          )
        );
        console.log(
          `[Cleanup] Returned ${totalQuantityToReturn} tickets to stock for ticket ${ticketId}`
        );
      }
      await Promise.all(ticketUpdatePromises);

      // Update users (remove bookings from their ticketsBooked arrays)
      const userUpdatePromises = [];
      for (const [userId, bookingIdsToRemove] of userUpdates) {
        userUpdatePromises.push(
          User.findByIdAndUpdate(
            userId,
            { $pull: { ticketsBooked: { $in: bookingIdsToRemove } } },
            { session }
          )
        );
      }
      await Promise.all(userUpdatePromises);

      // Update payments
      if (paymentUpdates.length > 0) {
        const paymentUpdatePromises = paymentUpdates.map(update =>
          Payment.findByIdAndUpdate(
            update._id,
            { status: update.status, expiredAt: update.expiredAt },
            { session }
          )
        );
        await Promise.all(paymentUpdatePromises);
      }

      await session.commitTransaction();

      console.log(
        `[Cleanup] Successfully cleaned up ${expiredBookings.length} expired bookings`
      );
      console.log(
        `[Cleanup] Updated ${ticketUpdates.size} unique tickets, ${userUpdates.size} users, ${paymentUpdates.length} payments`
      );

    } catch (error) {
      await session.abortTransaction();
      console.error("[Cleanup] Error in cleanup transaction:", error);
      throw error;
    }

  } catch (error) {
    console.error("[Cleanup] Error in cleanupExpiredBookings:", error);
  } finally {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
  }
};

/**
 * تنظيف الدفعات القديمة الفاشلة أو المنتهية الصلاحية
 */
export const cleanupOldFailedPayments = async () => {
  try {
    console.log("[Cleanup] Starting old failed payments cleanup...");

    // حذف الدفعات الفاشلة أو المنتهية الصلاحية الأقدم من 30 يوم
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Payment.deleteMany({
      status: { $in: ["failed", "expired", "cancelled"] },
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log(`[Cleanup] Deleted ${result.deletedCount} old failed payments`);
  } catch (error) {
    console.error("[Cleanup] Error in cleanupOldFailedPayments:", error);
  }
};

/**
 * إحصائيات الحجوزات للمراقبة
 */
export const logBookingStats = async () => {
  try {
    const stats = await Promise.all([
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "captured" }),
      Payment.countDocuments({ status: "failed" }),
    ]);

    console.log(
      `[Stats] Bookings - Pending: ${stats[0]}, Confirmed: ${stats[1]}, Cancelled: ${stats[2]}`
    );
    console.log(
      `[Stats] Payments - Pending: ${stats[3]}, Captured: ${stats[4]}, Failed: ${stats[5]}`
    );
  } catch (error) {
    console.error("[Stats] Error logging booking stats:", error);
  }
};

/**
 * التحقق من الحجوزات المعلقة مع بوابة الدفع
 * للتأكد من تزامن حالة الدفع
 */
export const verifyPendingPaymentsWithGateway = async () => {
  try {
    console.log("[Payment Verification] Starting pending payments verification...");

    // استيراد PaymentService و WebhookService بشكل ديناميكي لتجنب circular dependency
    const { default: PaymentService } = await import("../controllers/checkout.controller.js");

    // العثور على الحجوزات المعلقة لأكثر من 10 دقائق ولديها paymentOrderId
    const pendingBookings = await Booking.find({
      status: 'pending',
      paymentStatus: { $in: ['pending', 'processing'] },
      createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) }, // أكثر من 10 دقائق
      paymentOrderId: { $exists: true, $ne: null }
    });

    if (pendingBookings.length === 0) {
      console.log("[Payment Verification] No pending bookings found");
      return;
    }

    console.log(`[Payment Verification] Found ${pendingBookings.length} pending bookings to verify`);

    let verifiedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const booking of pendingBookings) {
      try {
        // استيراد checkout controller للوصول إلى PaymentService
        const checkoutModule = await import("../controllers/checkout.controller.js");
        const PaymentService = checkoutModule.PaymentService;

        if (PaymentService && PaymentService.getPaymentDetails) {
          const paymentDetails = await PaymentService.getPaymentDetails(booking.paymentOrderId);

          if (paymentDetails) {
            verifiedCount++;
            const gatewayStatus = paymentDetails.status?.toLowerCase();

            // استيراد WebhookService
            const WebhookService = checkoutModule.WebhookService;

            if (['captured', 'paid'].includes(gatewayStatus) && booking.paymentStatus !== 'completed') {
              // الدفع نجح ولكن لم يتم تحديث قاعدة البيانات
              if (WebhookService && WebhookService.handleSuccessfulPayment) {
                await WebhookService.handleSuccessfulPayment(paymentDetails);
                updatedCount++;
                console.log(`[Payment Verification] Updated successful payment for booking ${booking._id}`);
              }
            } else if (['declined', 'failed', 'cancelled'].includes(gatewayStatus) && booking.paymentStatus !== 'failed') {
              // الدفع فشل ولكن لم يتم تحديث قاعدة البيانات
              if (WebhookService && WebhookService.handleFailedPayment) {
                await WebhookService.handleFailedPayment(paymentDetails);
                updatedCount++;
                console.log(`[Payment Verification] Updated failed payment for booking ${booking._id}`);
              }
            }
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`[Payment Verification] Error verifying booking ${booking._id}:`, error.message);
      }
    }

    console.log(`[Payment Verification] Completed - Checked: ${pendingBookings.length}, Verified: ${verifiedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error("[Payment Verification] Error in verifyPendingPaymentsWithGateway:", error);
  }
};

/**
 * تشغيل جميع مهام التنظيف باستخدام cron jobs
 */
export const startCleanupJobs = () => {
  // تشغيل تنظيف الحجوزات المنتهية الصلاحية كل 5 دقائق
  cron.schedule("*/5 * * * *", () => {
    console.log("[Cron] Running expired bookings cleanup...");
    cleanupExpiredBookings();
  });

  // تشغيل التحقق من الحجوزات المعلقة مع بوابة الدفع كل 10 دقائق
  cron.schedule("*/10 * * * *", () => {
    console.log("[Cron] Running pending payments verification with gateway...");
    verifyPendingPaymentsWithGateway();
  });

  // تشغيل تنظيف الدفعات القديمة يومياً في الساعة 2:00 صباحاً
  cron.schedule("0 2 * * *", () => {
    console.log("[Cron] Running old failed payments cleanup...");
    cleanupOldFailedPayments();
  });

  // طباعة الإحصائيات كل ساعة
  cron.schedule("0 * * * *", () => {
    console.log("[Cron] Logging booking stats...");
    logBookingStats();
  });

  console.log("[Cron] All cleanup jobs scheduled successfully");
};

/**
 * إيقاف جميع مهام التنظيف
 */
export const stopCleanupJobs = () => {
  cron.destroyAll();
  console.log("[Cron] All cleanup jobs stopped");
};
