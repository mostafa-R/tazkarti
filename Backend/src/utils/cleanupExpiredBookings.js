import mongoose from "mongoose";
import cron from "node-cron";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import User from "../models/User.js";

/**
 * تنظيف الحجوزات المعلقة المنتهية الصلاحية
 * يتم تشغيل هذه المهمة كل 5 دقائق
 */
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

    // معالجة كل حجز منتهي الصلاحية
    for (const booking of expiredBookings) {
      session.startTransaction();

      try {
        console.log(`[Cleanup] Processing expired booking: ${booking._id}`);

        // تحديث حالة الحجز
        booking.status = "cancelled";
        booking.paymentStatus = "expired";
        await booking.save({ session });

        // إعادة التذاكر إلى المخزون
        if (booking.ticket) {
          await Ticket.findByIdAndUpdate(
            booking.ticket._id,
            { $inc: { availableQuantity: booking.quantity } },
            { session }
          );
          console.log(
            `[Cleanup] Returned ${booking.quantity} tickets to stock for ticket ${booking.ticket._id}`
          );
        }

        // إزالة الحجز من قائمة حجوزات المستخدم
        await User.findByIdAndUpdate(
          booking.user,
          { $pull: { ticketsBooked: booking._id } },
          { session }
        );

        // تحديث سجل الدفعة إن وجد
        const payment = await Payment.findOne({ booking: booking._id }).session(
          session
        );
        if (payment) {
          payment.status = "expired";
          payment.expiredAt = new Date();
          await payment.save({ session });
        }

        await session.commitTransaction();
        console.log(
          `[Cleanup] Successfully cleaned up booking: ${booking._id}`
        );
      } catch (error) {
        await session.abortTransaction();
        console.error(
          `[Cleanup] Error processing booking ${booking._id}:`,
          error
        );
      }
    }

    console.log(
      `[Cleanup] Finished processing ${expiredBookings.length} expired bookings`
    );
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
 * تشغيل جميع مهام التنظيف باستخدام cron jobs
 */
export const startCleanupJobs = () => {
  // تشغيل تنظيف الحجوزات المنتهية الصلاحية كل 5 دقائق
  cron.schedule("*/5 * * * *", () => {
    console.log("[Cron] Running expired bookings cleanup...");
    cleanupExpiredBookings();
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
