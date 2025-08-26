import Redis from "ioredis";

/**
 * خدمة التخزين المؤقت (Cache) باستخدام Redis
 */
class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.connectionAttempted = false;
    this.connectionFailed = false;
    this.lastWarningTime = 0;
    this.connect();
  }

  /**
   * الاتصال بـ Redis
   */
  async connect() {
    if (this.connectionAttempted) return;

    try {
      this.connectionAttempted = true;

      this.redis = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: null, // Disable retries to fail fast
        lazyConnect: true,
        connectTimeout: 3000, // Very short timeout
        commandTimeout: 2000,
      });

      // أحداث الاتصال
      this.redis.on("connect", () => {
        console.log("✅ Redis connected successfully");
        this.isConnected = true;
        this.connectionFailed = false;
      });

      this.redis.on("error", (error) => {
        this.isConnected = false;
        this.connectionFailed = true;
      });

      this.redis.on("close", () => {
        this.isConnected = false;
      });

      // محاولة الاتصال
      await this.redis.connect();
    } catch (error) {
      this.logWarning(
        "⚠️ Redis not available - running without cache (performance may be reduced)"
      );
      this.isConnected = false;
      this.connectionFailed = true;
      this.redis = null;
    }
  }

  /**
   * التحقق من حالة الاتصال
   */
  isReady() {
    if (this.connectionFailed) return false;
    return this.isConnected && this.redis?.status === "ready";
  }

  /**
   * تسجيل تحذير مع تحكم في التردد
   */
  logWarning(message) {
    const now = Date.now();
    // اظهار التحذير مرة واحدة فقط كل 5 دقائق
    if (now - this.lastWarningTime > 5 * 60 * 1000) {
      console.warn(message);
      this.lastWarningTime = now;
    }
  }

  /**
   * تعيين قيمة في التخزين المؤقت
   */
  async set(key, value, expireInSeconds = 3600) {
    if (!this.isReady()) return false;

    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, expireInSeconds, serializedValue);
      return true;
    } catch (error) {
      this.logWarning(`Cache set error: ${error.message}`);
      return false;
    }
  }

  /**
   * الحصول على قيمة من التخزين المؤقت
   */
  async get(key) {
    if (!this.isReady()) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logWarning(`Cache get error: ${error.message}`);
      return null;
    }
  }

  /**
   * حذف مفتاح من التخزين المؤقت
   */
  async del(key) {
    if (!this.isReady()) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logWarning(`Cache delete error: ${error.message}`);
      return false;
    }
  }

  /**
   * حذف جميع المفاتيح التي تطابق نمط معين
   */
  async delPattern(pattern) {
    if (!this.isReady()) return false;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      this.logWarning(`Cache delete pattern error: ${error.message}`);
      return false;
    }
  }

  /**
   * التحقق من وجود مفتاح
   */
  async exists(key) {
    if (!this.isReady()) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logWarning(`Cache exists error: ${error.message}`);
      return false;
    }
  }

  /**
   * تعيين انتهاء صلاحية لمفتاح موجود
   */
  async expire(key, seconds) {
    if (!this.isReady()) return false;

    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      this.logWarning(`Cache expire error: ${error.message}`);
      return false;
    }
  }

  /**
   * زيادة قيمة رقمية
   */
  async incr(key, expireInSeconds = 3600) {
    if (!this.isReady()) return null;

    try {
      const result = await this.redis.incr(key);
      if (result === 1) {
        // إذا كان هذا أول إنشاء للمفتاح، اعمل expire
        await this.redis.expire(key, expireInSeconds);
      }
      return result;
    } catch (error) {
      this.logWarning(`Cache incr error: ${error.message}`);
      return null;
    }
  }

  /**
   * إضافة عنصر إلى قائمة
   */
  async lpush(key, value, expireInSeconds = 3600) {
    if (!this.isReady()) return false;

    try {
      await this.redis.lpush(key, JSON.stringify(value));
      await this.redis.expire(key, expireInSeconds);
      return true;
    } catch (error) {
      this.logWarning(`Cache lpush error: ${error.message}`);
      return false;
    }
  }

  /**
   * الحصول على عناصر من قائمة
   */
  async lrange(key, start = 0, stop = -1) {
    if (!this.isReady()) return [];

    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map((value) => JSON.parse(value));
    } catch (error) {
      this.logWarning(`Cache lrange error: ${error.message}`);
      return [];
    }
  }

  /**
   * إضافة عضو إلى مجموعة
   */
  async sadd(key, member, expireInSeconds = 3600) {
    if (!this.isReady()) return false;

    try {
      await this.redis.sadd(key, member);
      await this.redis.expire(key, expireInSeconds);
      return true;
    } catch (error) {
      this.logWarning(`Cache sadd error: ${error.message}`);
      return false;
    }
  }

  /**
   * التحقق من عضوية في مجموعة
   */
  async sismember(key, member) {
    if (!this.isReady()) return false;

    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logWarning(`Cache sismember error: ${error.message}`);
      return false;
    }
  }

  /**
   * الحصول على جميع أعضاء المجموعة
   */
  async smembers(key) {
    if (!this.isReady()) return [];

    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logWarning(`Cache smembers error: ${error.message}`);
      return [];
    }
  }

  /**
   * مسح جميع البيانات المخزنة مؤقتاً
   */
  async flushAll() {
    if (!this.isReady()) return false;

    try {
      await this.redis.flushall();
      console.log("✅ Cache cleared successfully");
      return true;
    } catch (error) {
      this.logWarning(`Cache flush error: ${error.message}`);
      return false;
    }
  }

  /**
   * الحصول على معلومات Redis
   */
  async getInfo() {
    if (!this.isReady()) return null;

    try {
      const info = await this.redis.info("memory");
      const keyspace = await this.redis.info("keyspace");
      return { memory: info, keyspace };
    } catch (error) {
      this.logWarning(`Cache info error: ${error.message}`);
      return null;
    }
  }

  /**
   * إغلاق الاتصال
   */
  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      console.log("Redis connection closed");
    }
  }
}

// إنشاء instance واحد للتطبيق كله
const cacheService = new CacheService();

export default cacheService;

// ==================================================
// دوال مساعدة للـ caching الذكي
// ==================================================

/**
 * إنشاء مفتاح cache لأحداث المستخدم
 */
export function createUserEventsKey(userId, filters = {}) {
  const filterStr = Object.keys(filters)
    .sort()
    .map((key) => `${key}:${filters[key]}`)
    .join("|");
  return `user_events:${userId}:${filterStr}`;
}

/**
 * إنشاء مفتاح cache للأحداث العامة
 */
export function createPublicEventsKey(filters = {}) {
  const filterStr = Object.keys(filters)
    .sort()
    .map((key) => `${key}:${filters[key]}`)
    .join("|");
  return `public_events:${filterStr}`;
}

/**
 * إنشاء مفتاح cache لحجوزات المنظم
 */
export function createOrganizerBookingsKey(organizerId, filters = {}) {
  const filterStr = Object.keys(filters)
    .sort()
    .map((key) => `${key}:${filters[key]}`)
    .join("|");
  return `organizer_bookings:${organizerId}:${filterStr}`;
}

/**
 * إنشاء مفتاح cache للتقارير
 */
export function createReportKey(organizerId, type, params = {}) {
  const paramStr = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|");
  return `report:${type}:${organizerId}:${paramStr}`;
}

/**
 * تنظيف cache الأحداث عند تحديثها
 */
export async function invalidateEventCache(eventId) {
  const patterns = [
    `public_events:*`,
    `user_events:*`,
    `event_details:${eventId}`,
    `event_tickets:${eventId}`,
  ];

  for (const pattern of patterns) {
    await cacheService.delPattern(pattern);
  }
}

/**
 * تنظيف cache الحجوزات عند تحديثها
 */
export async function invalidateBookingCache(userId, organizerId, eventId) {
  const patterns = [
    `user_bookings:${userId}:*`,
    `organizer_bookings:${organizerId}:*`,
    `event_bookings:${eventId}:*`,
    `booking_stats:${organizerId}:*`,
  ];

  for (const pattern of patterns) {
    await cacheService.delPattern(pattern);
  }
}
