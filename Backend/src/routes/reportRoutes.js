import express from "express";
import {
  getFinancialReport,
  getPerformanceComparison,
  getTaxReport,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { cacheFinancialReports } from "../middleware/performanceMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const router = express.Router();

// جميع routes التقارير تتطلب تسجيل دخول
router.use(authMiddleware);

// ====== تقارير المنظمين ======
/**
 * @route   GET /api/reports/financial
 * @desc    الحصول على التقرير المالي الشامل
 * @access  Private (Organizer)
 * @query   startDate, endDate, eventId, format (json/pdf/csv), granularity (day/week/month/year)
 */
router.get(
  "/financial",
  roleMiddleware(["organizer", "admin"]),
  cacheFinancialReports, // Cache للتقارير المالية
  getFinancialReport
);

/**
 * @route   GET /api/reports/performance-comparison
 * @desc    مقارنة الأداء بين فترتين
 * @access  Private (Organizer)
 * @query   currentStartDate, currentEndDate, previousStartDate, previousEndDate
 */
router.get(
  "/performance-comparison",
  roleMiddleware(["organizer", "admin"]),
  cacheFinancialReports, // Cache للمقارنات
  getPerformanceComparison
);

/**
 * @route   GET /api/reports/tax
 * @desc    تقرير الضرائب (سنوي أو ربع سنوي)
 * @access  Private (Organizer)
 * @query   year, quarter (optional)
 */
router.get(
  "/tax",
  roleMiddleware(["organizer", "admin"]),
  cacheFinancialReports, // Cache لتقارير الضرائب
  getTaxReport
);

// ====== تقارير الإدارة فقط ======
/**
 * @route   GET /api/reports/admin/platform-revenue
 * @desc    إيرادات المنصة الإجمالية
 * @access  Private (Admin)
 */
router.get(
  "/admin/platform-revenue",
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // فلتر التاريخ
      let dateFilter = { paymentStatus: "completed" };
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      const platformStats = await Booking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalBookings: { $sum: 1 },
            totalTickets: { $sum: "$quantity" },
          },
        },
      ]);

      // إحصائيات المنظمين
      const organizerStats = await User.aggregate([
        { $match: { role: "organizer" } },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "organizer",
            as: "events",
          },
        },
        {
          $project: {
            userName: 1,
            email: 1,
            eventsCount: { $size: "$events" },
            createdAt: 1,
          },
        },
        { $sort: { eventsCount: -1 } },
      ]);

      const data = {
        platformRevenue: platformStats[0] || {
          totalRevenue: 0,
          totalBookings: 0,
          totalTickets: 0,
        },
        topOrganizers: organizerStats.slice(0, 10),
        totalOrganizers: organizerStats.length,
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Platform Revenue Report Error:", error);
      return res.status(500).json({
        success: false,
        message: "خطأ في تقرير إيرادات المنصة",
        error: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/reports/admin/user-analytics
 * @desc    تحليلات المستخدمين
 * @access  Private (Admin)
 */
router.get(
  "/admin/user-analytics",
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const [totalUsers, usersByRole, userGrowth, activeUsers] =
        await Promise.all([
          // إجمالي المستخدمين
          User.countDocuments(),

          // المستخدمين حسب الدور
          User.aggregate([
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ]),

          // نمو المستخدمين (آخر 12 شهر)
          User.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(
                    new Date().setMonth(new Date().getMonth() - 12)
                  ),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                newUsers: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),

          // المستخدمين النشطين (لديهم حجوزات في آخر 30 يوم)
          Booking.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
              },
            },
            {
              $group: {
                _id: "$user",
              },
            },
            {
              $count: "activeUsers",
            },
          ]),
        ]);

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          usersByRole,
          userGrowth,
          activeUsers: activeUsers[0]?.activeUsers || 0,
          activityRate:
            totalUsers > 0
              ? (
                  ((activeUsers[0]?.activeUsers || 0) / totalUsers) *
                  100
                ).toFixed(2)
              : 0,
        },
      });
    } catch (error) {
      console.error("User Analytics Error:", error);
      return res.status(500).json({
        success: false,
        message: "خطأ في تحليلات المستخدمين",
        error: error.message,
      });
    }
  }
);

export default router;
