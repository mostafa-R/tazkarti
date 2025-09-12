import compression from "compression";
import rateLimit from "express-rate-limit";
import cacheService, {
  createOrganizerBookingsKey,
  createPublicEventsKey,
  createReportKey,
  createUserEventsKey,
} from "../services/cacheService.js";

// ==================================================
// Rate Limiting Configuration
// ==================================================

/**
 * Rate limiter عام للـ API
 */
export const generalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب كحد أقصى لكل IP
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // تخطي الـ rate limit للمستخدمين المصرح لهم
  skip: (req) => {
    // تخطي للـ admin
    const allowedRoles = ["admin", "organizer"];
    return allowedRoles.includes(req.user?.role);
  },
});

/**
 * Rate limiter للمصادقة (تسجيل دخول/خروج)
 */
export const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 دقيقة
  max: 20, // 5 محاولات فقط لكل IP
  message: {
    success: false,
    message:
      "تم تجاوز الحد المسموح من محاولات تسجيل الدخول. يرجى الانتظار 15 دقيقة",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // استخدام IP فقط (default behavior) لتجنب مشاكل IPv6
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter للدفعات
 */
export const paymentRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 5 دقائق
  max: 15, // 3 محاولات دفع فقط لكل IP
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح من محاولات الدفع. يرجى الانتظار 5 دقائق",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter لإنشاء الأحداث
 */
export const createEventRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // ساعة واحدة
  max: 15, // 5 أحداث كحد أقصى في الساعة
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح من إنشاء الأحداث في الساعة الواحدة",
    retryAfter: "1 hour",
  },
  keyGenerator: (req) => {
    return `create_event_${req.user?.id}`;
  },
});

// ==================================================
// Compression Middleware
// ==================================================

/**
 * ضغط الاستجابات لتحسين السرعة
 */
export const compressionMiddleware = compression({
  // ضغط فقط للاستجابات أكبر من 1KB
  threshold: 1024,
  // مستوى الضغط (1-9, 9 = أعلى ضغط)
  level: 6,
  // ضغط النصوص والـ JSON فقط
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// ==================================================
// Caching Middleware
// ==================================================

/**
 * Middleware للتخزين المؤقت للاستعلامات المتكررة
 */
export const cacheMiddleware = (keyGenerator, expireInSeconds = 300) => {
  return async (req, res, next) => {
    try {
      // إنشاء مفتاح التخزين المؤقت
      const cacheKey =
        typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;

      // محاولة الحصول على البيانات من التخزين المؤقت
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return res.status(200).json({
          success: true,
          data: cachedData,
          cached: true,
          cacheKey:
            process.env.NODE_ENV === "development" ? cacheKey : undefined,
        });
      }

      // إذا لم توجد البيانات، تابع للـ controller
      console.log(`❌ Cache miss: ${cacheKey}`);

      // حفظ الـ response الأصلي
      const originalJson = res.json;

      // استبدال res.json للتخزين المؤقت
      res.json = function (body) {
        // تخزين البيانات مؤقتاً فقط للاستجابات الناجحة
        if (res.statusCode === 200 && body.success) {
          cacheService
            .set(cacheKey, body.data, expireInSeconds)
            .then(() => console.log(`💾 Cached: ${cacheKey}`))
            .catch((err) => console.error("Cache set error:", err));
        }

        // استدعاء الدالة الأصلية
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      // تابع بدون cache في حالة الخطأ
      next();
    }
  };
};

/**
 * تخزين مؤقت للأحداث العامة
 */
export const cachePublicEvents = cacheMiddleware(
  (req) => createPublicEventsKey(req.query),
  600 // 10 دقائق
);

/**
 * تخزين مؤقت لأحداث المستخدم
 */
export const cacheUserEvents = cacheMiddleware(
  (req) => createUserEventsKey(req.user?.id, req.query),
  300 // 5 دقائق
);

/**
 * تخزين مؤقت لحجوزات المنظم
 */
export const cacheOrganizerBookings = cacheMiddleware(
  (req) => createOrganizerBookingsKey(req.user?.id, req.query),
  180 // 3 دقائق
);

/**
 * تخزين مؤقت للتقارير المالية
 */
export const cacheFinancialReports = cacheMiddleware(
  (req) => createReportKey(req.user?.id, "financial", req.query),
  900 // 15 دقيقة
);

// ==================================================
// Performance Monitoring Middleware
// ==================================================

/**
 * مراقبة أداء الـ API
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // إضافة معلومات الطلب
  req.requestInfo = {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    startTime,
  };

  // استبدال res.send لقياس الوقت
  res.send = function (data) {
    const duration = Date.now() - startTime;

    // إضافة headers للأداء
    res.set({
      "X-Response-Time": `${duration}ms`,
      "X-Powered-By": "Tazkarti API",
    });

    // تسجيل الطلبات البطيئة
    if (duration > 1000) {
      console.warn(
        `⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`
      );
    }

    // حفظ إحصائيات الأداء
    savePerformanceMetrics(req, res, duration);

    return originalSend.call(this, data);
  };

  next();
};

/**
 * حفظ مقاييس الأداء
 */
async function savePerformanceMetrics(req, res, duration) {
  try {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const hour = new Date().getHours();

    // مفاتيح إحصائيات مختلفة
    const keys = {
      daily: `perf:daily:${date}`,
      hourly: `perf:hourly:${date}:${hour}`,
      endpoint: `perf:endpoint:${req.method}:${req.route?.path || req.path}`,
      user: req.user?.id ? `perf:user:${req.user.id}` : null,
    };

    // حفظ الإحصائيات
    const promises = [];

    Object.values(keys).forEach((key) => {
      if (key) {
        // عدد الطلبات
        promises.push(cacheService.incr(`${key}:count`, 86400));
        // إجمالي الوقت
        promises.push(cacheService.incr(`${key}:duration`, 86400));
        // أبطأ طلب
        promises.push(updateMaxDuration(key, duration));
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Performance metrics error:", error);
  }
}

/**
 * تحديث أبطأ مدة زمنية
 */
async function updateMaxDuration(key, duration) {
  const maxKey = `${key}:max_duration`;
  const currentMax = await cacheService.get(maxKey);

  if (!currentMax || duration > currentMax) {
    await cacheService.set(maxKey, duration, 86400);
  }
}

/**
 * الحصول على إحصائيات الأداء
 */
export const getPerformanceStats = async () => {
  try {
    const date = new Date().toISOString().split("T")[0];
    const keys = {
      count: `perf:daily:${date}:count`,
      duration: `perf:daily:${date}:duration`,
      max: `perf:daily:${date}:max_duration`,
    };

    const [count, totalDuration, maxDuration] = await Promise.all([
      cacheService.get(keys.count),
      cacheService.get(keys.duration),
      cacheService.get(keys.max),
    ]);

    return {
      totalRequests: count || 0,
      averageResponseTime: count ? Math.round(totalDuration / count) : 0,
      slowestRequest: maxDuration || 0,
      date,
    };
  } catch (error) {
    console.error("Get performance stats error:", error);
    return null;
  }
};

// ==================================================
// Health Check Middleware
// ==================================================

/**
 * فحص صحة النظام
 */
export const healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: {
        connected: cacheService.isReady(),
        info: await cacheService.getInfo(),
      },
      performance: await getPerformanceStats(),
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
