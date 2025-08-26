import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";
import { Event } from "../models/Event.js";
import Payment from "../models/Payment.js";

/**
 * الحصول على التقرير المالي الشامل للمنظم
 */
export const getFinancialReport = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const {
      startDate,
      endDate,
      eventId,
      format = "json", // json, csv, pdf
      granularity = "month", // day, week, month, year
    } = req.query;

    // بناء الفلتر الأساسي
    const eventQuery = { organizer: organizerId };
    if (eventId) eventQuery._id = eventId;

    // الحصول على جميع أحداث المنظم
    const organizerEvents = await Event.find(eventQuery).select("_id title");
    const eventIds = organizerEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "لا توجد أحداث للمنظم",
        data: {
          summary: {
            totalRevenue: 0,
            totalBookings: 0,
            totalEvents: 0,
            averageTicketPrice: 0,
          },
        },
      });
    }

    // فلتر التاريخ
    let dateFilter = { event: { $in: eventIds } };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // التقارير الأساسية
    const [
      totalBookings,
      confirmedBookings,
      totalRevenue,
      refundedAmount,
      ticketsSold,
      revenueByEvent,
      revenueOverTime,
      topEvents,
      ticketTypeBreakdown,
    ] = await Promise.all([
      // إجمالي الحجوزات
      Booking.countDocuments(dateFilter),

      // الحجوزات المؤكدة
      Booking.countDocuments({
        ...dateFilter,
        status: "confirmed",
        paymentStatus: "completed",
      }),

      // إجمالي الإيرادات
      Booking.aggregate([
        { $match: { ...dateFilter, paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // المبالغ المستردة
      Payment.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $match: {
            "booking.event": { $in: eventIds },
            status: { $in: ["refunded", "partially_refunded"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$refundAmount" } } },
      ]),

      // عدد التذاكر المباعة
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "confirmed",
            paymentStatus: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),

      // الإيرادات حسب الحدث
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "confirmed",
            paymentStatus: "completed",
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
      ]),

      // الإيرادات عبر الزمن
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "confirmed",
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id:
              granularity === "day"
                ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                : granularity === "week"
                ? { $dateToString: { format: "%Y-W%V", date: "$createdAt" } }
                : granularity === "month"
                ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                : { $dateToString: { format: "%Y", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            bookings: { $sum: 1 },
            tickets: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // أفضل الأحداث أداءً
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "confirmed",
            paymentStatus: "completed",
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
        { $limit: 10 },
      ]),

      // تفصيل أنواع التذاكر
      Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "confirmed",
            paymentStatus: "completed",
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
    ]);

    // تجميع البيانات
    const summary = {
      totalRevenue: totalRevenue[0]?.total || 0,
      netRevenue:
        (totalRevenue[0]?.total || 0) - (refundedAmount[0]?.total || 0),
      totalBookings,
      confirmedBookings,
      cancellationRate:
        totalBookings > 0
          ? (
              ((totalBookings - confirmedBookings) / totalBookings) *
              100
            ).toFixed(2)
          : 0,
      ticketsSold: ticketsSold[0]?.total || 0,
      averageTicketPrice:
        confirmedBookings > 0
          ? (
              (totalRevenue[0]?.total || 0) / (ticketsSold[0]?.total || 1)
            ).toFixed(2)
          : 0,
      totalEvents: organizerEvents.length,
      refundedAmount: refundedAmount[0]?.total || 0,
    };

    const reportData = {
      summary,
      revenueByEvent: revenueByEvent.slice(0, 10),
      revenueOverTime,
      topEvents,
      ticketTypeBreakdown,
      dateRange: {
        from: startDate || "البداية",
        to: endDate || "الآن",
        granularity,
      },
      generatedAt: new Date().toISOString(),
      organizerId,
    };

    // إرجاع البيانات حسب التنسيق المطلوب
    if (format === "pdf") {
      return generatePDFReport(res, reportData);
    }

    if (format === "csv") {
      return generateCSVReport(res, reportData);
    }

    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Financial Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في إنشاء التقرير المالي",
      error: error.message,
    });
  }
};

/**
 * الحصول على مقارنة الأداء بين فترات مختلفة
 */
export const getPerformanceComparison = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const {
      currentStartDate,
      currentEndDate,
      previousStartDate,
      previousEndDate,
    } = req.query;

    if (
      !currentStartDate ||
      !currentEndDate ||
      !previousStartDate ||
      !previousEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "جميع تواريخ الفترات مطلوبة للمقارنة",
      });
    }

    // الحصول على أحداث المنظم
    const organizerEvents = await Event.find({ organizer: organizerId }).select(
      "_id"
    );
    const eventIds = organizerEvents.map((event) => event._id);

    const [currentPeriod, previousPeriod] = await Promise.all([
      getRevenueData(
        eventIds,
        new Date(currentStartDate),
        new Date(currentEndDate)
      ),
      getRevenueData(
        eventIds,
        new Date(previousStartDate),
        new Date(previousEndDate)
      ),
    ]);

    // حساب نسب التغيير
    const comparison = {
      revenue: {
        current: currentPeriod.revenue,
        previous: previousPeriod.revenue,
        change: calculatePercentageChange(
          previousPeriod.revenue,
          currentPeriod.revenue
        ),
      },
      bookings: {
        current: currentPeriod.bookings,
        previous: previousPeriod.bookings,
        change: calculatePercentageChange(
          previousPeriod.bookings,
          currentPeriod.bookings
        ),
      },
      tickets: {
        current: currentPeriod.tickets,
        previous: previousPeriod.tickets,
        change: calculatePercentageChange(
          previousPeriod.tickets,
          currentPeriod.tickets
        ),
      },
      averageTicketPrice: {
        current: currentPeriod.averagePrice,
        previous: previousPeriod.averagePrice,
        change: calculatePercentageChange(
          previousPeriod.averagePrice,
          currentPeriod.averagePrice
        ),
      },
    };

    return res.status(200).json({
      success: true,
      data: {
        comparison,
        periods: {
          current: { start: currentStartDate, end: currentEndDate },
          previous: { start: previousStartDate, end: previousEndDate },
        },
      },
    });
  } catch (error) {
    console.error("Performance Comparison Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في مقارنة الأداء",
      error: error.message,
    });
  }
};

/**
 * الحصول على تقرير الضرائب
 */
export const getTaxReport = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { year, quarter } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "السنة مطلوبة لتقرير الضرائب",
      });
    }

    let startDate, endDate;

    if (quarter) {
      // ربع سنوي
      const quarterStart = [(0, 3, 6, 9)[parseInt(quarter) - 1]];
      startDate = new Date(year, quarterStart, 1);
      endDate = new Date(year, quarterStart + 3, 0);
    } else {
      // سنوي
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const organizerEvents = await Event.find({ organizer: organizerId }).select(
      "_id"
    );
    const eventIds = organizerEvents.map((event) => event._id);

    const taxData = await Booking.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          status: "confirmed",
          paymentStatus: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: "$quantity" },
        },
      },
    ]);

    const refunds = await Payment.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.event": { $in: eventIds },
          status: { $in: ["refunded", "partially_refunded"] },
          refundDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: "$refundAmount" },
        },
      },
    ]);

    const grossRevenue = taxData[0]?.grossRevenue || 0;
    const totalRefunds = refunds[0]?.totalRefunds || 0;
    const netRevenue = grossRevenue - totalRefunds;

    // حساب الضريبة (افتراض 14% ضريبة القيمة المضافة)
    const vatRate = 0.14;
    const vatAmount = netRevenue * vatRate;
    const revenueAfterVAT = netRevenue - vatAmount;

    return res.status(200).json({
      success: true,
      data: {
        period: quarter ? `Q${quarter} ${year}` : year,
        grossRevenue,
        totalRefunds,
        netRevenue,
        vatAmount,
        revenueAfterVAT,
        totalBookings: taxData[0]?.totalBookings || 0,
        totalTickets: taxData[0]?.totalTickets || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Tax Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطأ في إنشاء تقرير الضرائب",
      error: error.message,
    });
  }
};

// ==================================================
// دوال مساعدة
// ==================================================

/**
 * الحصول على بيانات الإيرادات لفترة محددة
 */
async function getRevenueData(eventIds, startDate, endDate) {
  const result = await Booking.aggregate([
    {
      $match: {
        event: { $in: eventIds },
        status: "confirmed",
        paymentStatus: "completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
        tickets: { $sum: "$quantity" },
        averagePrice: { $avg: "$totalPrice" },
      },
    },
  ]);

  return (
    result[0] || {
      revenue: 0,
      bookings: 0,
      tickets: 0,
      averagePrice: 0,
    }
  );
}

/**
 * حساب نسبة التغيير المئوية
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return (((newValue - oldValue) / oldValue) * 100).toFixed(2);
}

/**
 * إنشاء تقرير PDF
 */
function generatePDFReport(res, data) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=financial-report.pdf"
  );
  doc.pipe(res);

  // عنوان التقرير
  doc.fontSize(18).text("تقرير مالي - منصة تذكرتي", { align: "center" });
  doc.moveDown();

  // معلومات أساسية
  doc
    .fontSize(14)
    .text(`تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-EG")}`);
  doc.text(`الفترة: من ${data.dateRange.from} إلى ${data.dateRange.to}`);
  doc.moveDown();

  // الملخص
  doc.fontSize(16).text("ملخص الأداء:", { underline: true });
  doc
    .fontSize(12)
    .text(`إجمالي الإيرادات: ${data.summary.totalRevenue} جنيه`)
    .text(`صافي الإيرادات: ${data.summary.netRevenue} جنيه`)
    .text(`إجمالي الحجوزات: ${data.summary.totalBookings}`)
    .text(`الحجوزات المؤكدة: ${data.summary.confirmedBookings}`)
    .text(`التذاكر المباعة: ${data.summary.ticketsSold}`)
    .text(`متوسط سعر التذكرة: ${data.summary.averageTicketPrice} جنيه`);

  doc.end();
}

/**
 * إنشاء تقرير CSV
 */
function generateCSVReport(res, data) {
  let csvContent = "التاريخ,الإيرادات,الحجوزات,التذاكر\n";

  data.revenueOverTime.forEach((row) => {
    csvContent += `${row._id},${row.revenue},${row.bookings},${row.tickets}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=financial-report.csv"
  );
  res.send(csvContent);
}
