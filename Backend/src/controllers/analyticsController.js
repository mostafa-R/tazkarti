import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";
import User from "../models/User.js";
import cacheService from "../services/cacheService.js";

/**
 * تحليلات عامة للمنصة (للمديرين)
 */
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const cacheKey = `platform_analytics:${period}`;

    // محاولة الحصول من Cache أولاً
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // حساب تاريخ البداية حسب الفترة
    const now = new Date();
    let startDate;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // الإحصائيات الأساسية
    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalBookings,
      totalRevenue,
      newUsers,
      newEvents,
      newBookings,
      topEvents,
      topOrganizers,
      revenueByCategory,
      bookingTrends,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["user", "organizer"] } }),

      User.countDocuments({ role: "organizer" }),

      Event.countDocuments({ isActive: true }),

      Booking.countDocuments({ paymentStatus: "completed" }),

      Booking.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      User.countDocuments({
        createdAt: { $gte: startDate },
        role: { $in: ["user", "organizer"] },
      }),

      Event.countDocuments({
        createdAt: { $gte: startDate },
        isActive: true,
      }),

      Booking.countDocuments({
        createdAt: { $gte: startDate },
        paymentStatus: "completed",
      }),

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "event",
            foreignField: "_id",
            as: "eventInfo",
          },
        },
        { $unwind: "$eventInfo" },
        {
          $group: {
            _id: "$event",
            eventTitle: { $first: "$eventInfo.title" },
            totalRevenue: { $sum: "$totalPrice" },
            ticketsSold: { $sum: "$quantity" },
            bookingsCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "event",
            foreignField: "_id",
            as: "eventInfo",
          },
        },
        { $unwind: "$eventInfo" },
        {
          $lookup: {
            from: "users",
            localField: "eventInfo.organizer",
            foreignField: "_id",
            as: "organizerInfo",
          },
        },
        { $unwind: "$organizerInfo" },
        {
          $group: {
            _id: "$organizerInfo._id",
            organizerName: { $first: "$organizerInfo.organizationName" },
            organizerEmail: { $first: "$organizerInfo.email" },
            totalRevenue: { $sum: "$totalPrice" },
            eventsCount: { $addToSet: "$event" },
            bookingsCount: { $sum: 1 },
          },
        },
        {
          $project: {
            organizerName: 1,
            organizerEmail: 1,
            totalRevenue: 1,
            eventsCount: { $size: "$eventsCount" },
            bookingsCount: 1,
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "event",
            foreignField: "_id",
            as: "eventInfo",
          },
        },
        { $unwind: "$eventInfo" },
        {
          $group: {
            _id: "$eventInfo.category",
            totalRevenue: { $sum: "$totalPrice" },
            bookingsCount: { $sum: 1 },
            eventsCount: { $addToSet: "$event" },
          },
        },
        {
          $project: {
            category: "$_id",
            totalRevenue: 1,
            bookingsCount: 1,
            eventsCount: { $size: "$eventsCount" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // اتجاهات الحجز عبر الزمن
      Booking.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            bookings: { $sum: 1 },
            tickets: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // تجميع البيانات
    const analytics = {
      overview: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        period: period,
        periodStart: startDate.toISOString(),
        periodEnd: now.toISOString(),
      },
      growth: {
        newUsers,
        newEvents,
        newBookings,
        userGrowthRate:
          totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0,
        eventGrowthRate:
          totalEvents > 0 ? ((newEvents / totalEvents) * 100).toFixed(2) : 0,
        bookingGrowthRate:
          totalBookings > 0
            ? ((newBookings / totalBookings) * 100).toFixed(2)
            : 0,
      },
      topPerformers: {
        events: topEvents,
        organizers: topOrganizers,
      },
      breakdown: {
        revenueByCategory,
        bookingTrends,
      },
      generatedAt: now.toISOString(),
    };

    // حفظ في Cache لمدة 30 دقيقة
    await cacheService.set(cacheKey, analytics, 1800);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Platform Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب تحليلات المنصة",
      error: error.message,
    });
  }
};

/**
 * تحليلات المنظم الفردي
 */
export const getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { period = "30d" } = req.query;
    const cacheKey = `organizer_analytics:${organizerId}:${period}`;

    // محاولة الحصول من Cache أولاً
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // حساب تاريخ البداية
    const now = new Date();
    let startDate;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // الحصول على أحداث المنظم
    const organizerEvents = await Event.find({ organizer: organizerId }).select(
      "_id"
    );
    const eventIds = organizerEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overview: { message: "لم يتم إنشاء أحداث بعد" },
          hasEvents: false,
        },
      });
    }

    // إحصائيات المنظم
    const [
      totalEvents,
      publishedEvents,
      totalBookings,
      totalRevenue,
      totalTicketsSold,
      conversionRate,
      eventPerformance,
      revenueOverTime,
      ticketTypePerformance,
      audienceInsights,
      upcomingEvents,
    ] = await Promise.all([
      // إجمالي الأحداث
      Event.countDocuments({ organizer: organizerId, isActive: true }),

      // الأحداث المنشورة
      Event.countDocuments({
        organizer: organizerId,
        status: "published",
        approved: true,
      }),

      // إجمالي الحجوزات
      Booking.countDocuments({
        event: { $in: eventIds },
        paymentStatus: "completed",
      }),

      // إجمالي الإيرادات
      Booking.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            paymentStatus: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // إجمالي التذاكر المباعة
      Booking.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            paymentStatus: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),

      // معدل التحويل (العرض مقابل الحجز)
      calculateConversionRate(eventIds),

      // أداء الأحداث الفردية
      Booking.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "event",
            foreignField: "_id",
            as: "eventInfo",
          },
        },
        { $unwind: "$eventInfo" },
        {
          $group: {
            _id: "$event",
            eventTitle: { $first: "$eventInfo.title" },
            eventDate: { $first: "$eventInfo.startDate" },
            totalRevenue: { $sum: "$totalPrice" },
            ticketsSold: { $sum: "$quantity" },
            bookingsCount: { $sum: 1 },
            averageTicketPrice: { $avg: "$totalPrice" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // الإيرادات عبر الزمن
      Booking.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            bookings: { $sum: 1 },
            tickets: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // أداء أنواع التذاكر
      Booking.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            paymentStatus: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "tickets",
            localField: "ticket",
            foreignField: "_id",
            as: "ticketInfo",
          },
        },
        { $unwind: "$ticketInfo" },
        {
          $group: {
            _id: "$ticketInfo.type",
            totalRevenue: { $sum: "$totalPrice" },
            ticketsSold: { $sum: "$quantity" },
            bookingsCount: { $sum: 1 },
            averagePrice: { $avg: "$totalPrice" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // رؤى الجمهور
      getAudienceInsights(eventIds),

      // الأحداث القادمة
      Event.find({
        organizer: organizerId,
        startDate: { $gte: now },
        status: "published",
      })
        .select("title startDate location")
        .sort({ startDate: 1 })
        .limit(5),
    ]);

    const analytics = {
      overview: {
        totalEvents,
        publishedEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTicketsSold: totalTicketsSold[0]?.total || 0,
        averageRevenuePerEvent:
          totalEvents > 0
            ? ((totalRevenue[0]?.total || 0) / totalEvents).toFixed(2)
            : 0,
        conversionRate: conversionRate || 0,
        period: period,
      },
      performance: {
        eventPerformance,
        revenueOverTime,
        ticketTypePerformance,
      },
      insights: {
        audienceInsights,
        upcomingEvents,
        topPerformingEvent: eventPerformance[0] || null,
        recommendations: generateRecommendations(
          eventPerformance,
          ticketTypePerformance
        ),
      },
      generatedAt: now.toISOString(),
      hasEvents: true,
    };

    // حفظ في Cache لمدة 15 دقيقة
    await cacheService.set(cacheKey, analytics, 900);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Organizer Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب تحليلات المنظم",
      error: error.message,
    });
  }
};

/**
 * تحليلات حدث واحد محدد
 */
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    // التحقق من ملكية الحدث
    const event = await Event.findOne({
      _id: eventId,
      organizer: organizerId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "الحدث غير موجود أو ليس لديك صلاحية للوصول",
      });
    }

    const cacheKey = `event_analytics:${eventId}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const [
      bookingStats,
      revenueStats,
      ticketStats,
      timelineData,
      geographicData,
      deviceData,
      checkInStats,
    ] = await Promise.all([
      // إحصائيات الحجز
      Booking.aggregate([
        { $match: { event: mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
            tickets: { $sum: "$quantity" },
          },
        },
      ]),

      // إحصائيات الإيرادات
      Booking.aggregate([
        {
          $match: {
            event: mongoose.Types.ObjectId(eventId),
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            averageBookingValue: { $avg: "$totalPrice" },
            totalBookings: { $sum: 1 },
            totalTickets: { $sum: "$quantity" },
          },
        },
      ]),

      // إحصائيات التذاكر
      Ticket.find({ event: eventId }).select(
        "type price quantity availableQuantity"
      ),

      // البيانات الزمنية للحجوزات
      Booking.aggregate([
        {
          $match: {
            event: mongoose.Types.ObjectId(eventId),
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            bookings: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
            tickets: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // البيانات الجغرافية (من عناوين المستخدمين)
      getGeographicInsights(eventId),

      // بيانات الأجهزة (من User Agent)
      getDeviceInsights(eventId),

      // إحصائيات تسجيل الدخول
      Booking.aggregate([
        { $match: { event: mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            checkedIn: { $sum: { $cond: ["$checkedIn", 1, 0] } },
          },
        },
      ]),
    ]);

    const analytics = {
      eventInfo: {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        approved: event.approved,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
      },
      bookingStats,
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        averageBookingValue: 0,
        totalBookings: 0,
        totalTickets: 0,
      },
      tickets: ticketStats,
      timeline: timelineData,
      demographics: {
        geographic: geographicData,
        devices: deviceData,
      },
      checkIn: checkInStats[0] || { totalBookings: 0, checkedIn: 0 },
      generatedAt: new Date().toISOString(),
    };

    // حفظ في Cache لمدة 10 دقائق
    await cacheService.set(cacheKey, analytics, 600);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Event Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في جلب تحليلات الحدث",
      error: error.message,
    });
  }
};

// ==================================================
// دوال مساعدة
// ==================================================

/**
 * حساب معدل التحويل
 */
async function calculateConversionRate(eventIds) {
  try {
    const views = (await cacheService.get("event_views")) || {};
    const totalViews = Object.values(views).reduce(
      (sum, view) => sum + view,
      0
    );
    const totalBookings = await Booking.countDocuments({
      event: { $in: eventIds },
      paymentStatus: "completed",
    });

    return totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(2) : 0;
  } catch (error) {
    console.error("Conversion rate calculation error:", error);
    return 0;
  }
}

/**
 * رؤى الجمهور
 */
async function getAudienceInsights(eventIds) {
  try {
    return await Booking.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          paymentStatus: "completed",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: null,
          averageAge: {
            $avg: {
              $subtract: [
                new Date().getFullYear(),
                { $year: "$userInfo.dateOfBirth" },
              ],
            },
          },
          genderDistribution: {
            $push: "$userInfo.gender",
          },
          topCities: {
            $push: "$userInfo.address.city",
          },
        },
      },
    ]);
  } catch (error) {
    console.error("Audience insights error:", error);
    return [];
  }
}

/**
 * البيانات الجغرافية
 */
async function getGeographicInsights(eventId) {
  try {
    return await Booking.aggregate([
      {
        $match: {
          event: mongoose.Types.ObjectId(eventId),
          paymentStatus: "completed",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userInfo.address.city",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  } catch (error) {
    console.error("Geographic insights error:", error);
    return [];
  }
}

/**
 * بيانات الأجهزة
 */
async function getDeviceInsights(eventId) {
  // هذه الدالة تحتاج تطوير إضافي لتتبع User Agent
  // يمكن تطويرها لاحقاً مع إضافة تتبع أفضل
  return [
    { device: "Mobile", percentage: 65 },
    { device: "Desktop", percentage: 30 },
    { device: "Tablet", percentage: 5 },
  ];
}

/**
 * توليد التوصيات
 */
function generateRecommendations(eventPerformance, ticketTypePerformance) {
  const recommendations = [];

  if (eventPerformance.length > 0) {
    const avgRevenue =
      eventPerformance.reduce((sum, event) => sum + event.totalRevenue, 0) /
      eventPerformance.length;

    if (avgRevenue < 1000) {
      recommendations.push({
        type: "revenue",
        title: "تحسين الإيرادات",
        description: "جرب زيادة أسعار التذاكر أو إضافة أنواع تذاكر VIP",
        priority: "high",
      });
    }
  }

  if (
    ticketTypePerformance.some(
      (ticket) => ticket._id === "vip" && ticket.ticketsSold < 10
    )
  ) {
    recommendations.push({
      type: "marketing",
      title: "تسويق تذاكر VIP",
      description: "ركز على تسويق تذاكر VIP بمزايا إضافية واضحة",
      priority: "medium",
    });
  }

  recommendations.push({
    type: "engagement",
    title: "تفاعل الجمهور",
    description: "أضف المزيد من المحتوى التفاعلي والعروض الترويجية",
    priority: "medium",
  });

  return recommendations;
}

/**
 * تتبع عرض الحدث (لحساب معدل التحويل)
 */
export const trackEventView = async (req, res) => {
  try {
    const { eventId } = req.params;

    // زيادة عداد المشاهدات
    await cacheService.incr(`event_views:${eventId}`, 86400); // 24 ساعة

    return res.status(200).json({
      success: true,
      message: "تم تسجيل المشاهدة",
    });
  } catch (error) {
    console.error("Track event view error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في تسجيل المشاهدة",
    });
  }
};

/**
 * مسح cache التحليلات
 */
export const clearAnalyticsCache = async (req, res) => {
  try {
    await cacheService.delPattern("*analytics*");

    return res.status(200).json({
      success: true,
      message: "تم مسح cache التحليلات بنجاح",
    });
  } catch (error) {
    console.error("Clear analytics cache error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في مسح cache التحليلات",
    });
  }
};
