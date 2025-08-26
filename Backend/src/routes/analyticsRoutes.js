import express from "express";
import {
  clearAnalyticsCache,
  getEventAnalytics,
  getOrganizerAnalytics,
  getPlatformAnalytics,
  trackEventView,
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/performanceMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ====== Public Routes ======
/**
 * @route   POST /api/analytics/track/event/:eventId/view
 * @desc    تتبع مشاهدة حدث (لحساب معدل التحويل)
 * @access  Public
 */
router.post("/track/event/:eventId/view", trackEventView);

// جميع routes التالية تتطلب تسجيل دخول
router.use(authMiddleware);

// ====== Organizer Analytics ======
/**
 * @route   GET /api/analytics/organizer
 * @desc    تحليلات المنظم الشاملة
 * @access  Private (Organizer)
 * @query   period (7d, 30d, 90d, 1y)
 */
router.get(
  "/organizer",
  roleMiddleware(["organizer", "admin"]),
  cacheMiddleware(
    (req) => `organizer_analytics:${req.user._id}:${req.query.period || "30d"}`,
    900 // 15 دقيقة cache
  ),
  getOrganizerAnalytics
);

/**
 * @route   GET /api/analytics/event/:eventId
 * @desc    تحليلات حدث محدد
 * @access  Private (Organizer - owner only)
 */
router.get(
  "/event/:eventId",
  roleMiddleware(["organizer", "admin"]),
  cacheMiddleware(
    (req) => `event_analytics:${req.params.eventId}`,
    600 // 10 دقائق cache
  ),
  getEventAnalytics
);

// ====== Admin Analytics ======
/**
 * @route   GET /api/analytics/platform
 * @desc    تحليلات المنصة العامة (للإدارة فقط)
 * @access  Private (Admin)
 * @query   period (7d, 30d, 90d, 1y)
 */
router.get(
  "/platform",
  roleMiddleware(["admin"]),
  cacheMiddleware(
    (req) => `platform_analytics:${req.query.period || "30d"}`,
    1800 // 30 دقيقة cache
  ),
  getPlatformAnalytics
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    لوحة تحكم سريعة للتحليلات
 * @access  Private (Admin/Organizer)
 */
router.get("/dashboard", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const cacheKey = isAdmin
      ? "dashboard_analytics:admin"
      : `dashboard_analytics:organizer:${req.user._id}`;

    // محاولة الحصول من Cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    let dashboardData;

    if (isAdmin) {
      // Dashboard للإدارة
      const [totalUsers, totalEvents, totalRevenue, monthlyGrowth] =
        await Promise.all([
          User.countDocuments({ role: { $in: ["user", "organizer"] } }),
          Event.countDocuments({ isActive: true }),
          Booking.aggregate([
            { $match: { paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
          Booking.aggregate([
            {
              $match: {
                paymentStatus: "completed",
                createdAt: {
                  $gte: new Date(
                    new Date().setMonth(new Date().getMonth() - 1)
                  ),
                },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
        ]);

      dashboardData = {
        type: "admin",
        stats: {
          totalUsers,
          totalEvents,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyGrowth[0]?.total || 0,
        },
      };
    } else {
      // Dashboard للمنظم
      const organizerEvents = await Event.find({
        organizer: req.user._id,
      }).select("_id");
      const eventIds = organizerEvents.map((event) => event._id);

      const [totalEvents, totalBookings, totalRevenue, upcomingEvents] =
        await Promise.all([
          Event.countDocuments({
            organizer: req.user._id,
            isActive: true,
          }),
          Booking.countDocuments({
            event: { $in: eventIds },
            paymentStatus: "completed",
          }),
          Booking.aggregate([
            {
              $match: {
                event: { $in: eventIds },
                paymentStatus: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ]),
          Event.countDocuments({
            organizer: req.user._id,
            startDate: { $gte: new Date() },
            status: "published",
          }),
        ]);

      dashboardData = {
        type: "organizer",
        stats: {
          totalEvents,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          upcomingEvents,
        },
      };
    }

    // حفظ في Cache لمدة 10 دقائق
    await cacheService.set(cacheKey, dashboardData, 600);

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب بيانات لوحة التحكم",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/analytics/cache
 * @desc    مسح cache التحليلات (للإدارة فقط)
 * @access  Private (Admin)
 */
router.delete("/cache", roleMiddleware(["admin"]), clearAnalyticsCache);

/**
 * @route   GET /api/analytics/performance
 * @desc    مقاييس الأداء الفني للمنصة
 * @access  Private (Admin)
 */
router.get("/performance", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { getPerformanceStats } = await import(
      "../middleware/performanceMiddleware.js"
    );

    const performanceData = await getPerformanceStats();
    const cacheInfo = await cacheService.getInfo();

    // إحصائيات قاعدة البيانات
    const dbStats = await mongoose.connection.db.stats();

    const data = {
      api: performanceData,
      cache: {
        connected: cacheService.isReady(),
        info: cacheInfo,
      },
      database: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        avgObjSize: dbStats.avgObjSize,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize,
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Performance Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب مقاييس الأداء",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/analytics/real-time
 * @desc    تحليلات الوقت الفعلي
 * @access  Private (Admin/Organizer)
 */
router.get("/real-time", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let query = { createdAt: { $gte: oneHourAgo } };

    // إذا كان منظماً، فقط أحداثه
    if (!isAdmin) {
      const organizerEvents = await Event.find({
        organizer: req.user._id,
      }).select("_id");
      const eventIds = organizerEvents.map((event) => event._id);
      query.event = { $in: eventIds };
    }

    const [recentBookings, onlineUsers, activeEvents, realtimeRevenue] =
      await Promise.all([
        // الحجوزات الأخيرة
        Booking.find(query)
          .populate("event", "title")
          .populate("user", "userName email")
          .sort({ createdAt: -1 })
          .limit(10),

        // المستخدمين المتصلين (تقدير من cache)
        getOnlineUsersEstimate(),

        // الأحداث النشطة الآن
        Event.countDocuments({
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: "published",
          approved: true,
          ...(isAdmin ? {} : { organizer: req.user._id }),
        }),

        // إيرادات الساعة الأخيرة
        Booking.aggregate([
          {
            $match: {
              ...query,
              paymentStatus: "completed",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const data = {
      recentBookings,
      stats: {
        onlineUsers,
        activeEvents,
        hourlyRevenue: realtimeRevenue[0]?.total || 0,
        hourlyBookings: realtimeRevenue[0]?.count || 0,
      },
      timestamp: now.toISOString(),
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Real-time Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب التحليلات الفورية",
      error: error.message,
    });
  }
});

// ==================================================
// دوال مساعدة
// ==================================================

/**
 * تقدير المستخدمين المتصلين
 */
async function getOnlineUsersEstimate() {
  try {
    // يمكن تحسين هذا باستخدام WebSocket أو session tracking
    const activeSessionsKey = "active_sessions:*";
    const sessions = await cacheService.smembers(activeSessionsKey);
    return sessions.length;
  } catch (error) {
    console.error("Online users estimate error:", error);
    return 0;
  }
}

// Import required modules at the top
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import User from "../models/User.js";
import cacheService from "../services/cacheService.js";

export default router;
