import cacheService from "./cacheService.js";

/**
 * خدمة إدارة الجلسات والمستخدمين النشطين
 */
class SessionService {
  constructor() {
    this.SESSION_PREFIX = "session:";
    this.ACTIVE_USERS_KEY = "active_users";
    this.SESSION_EXPIRY = 30 * 60; // 30 دقيقة
  }

  /**
   * إنشاء جلسة جديدة للمستخدم
   */
  async createSession(userId, sessionData = {}) {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${userId}`;
      const sessionInfo = {
        userId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ...sessionData,
      };

      await cacheService.set(sessionKey, sessionInfo, this.SESSION_EXPIRY);
      await cacheService.sadd(
        this.ACTIVE_USERS_KEY,
        userId,
        this.SESSION_EXPIRY
      );

      console.log(`✅ Session created for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Create session error:", error);
      return false;
    }
  }

  /**
   * تحديث نشاط المستخدم
   */
  async updateActivity(userId, activityData = {}) {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${userId}`;
      const existingSession = await cacheService.get(sessionKey);

      if (existingSession) {
        const updatedSession = {
          ...existingSession,
          lastActivity: new Date().toISOString(),
          ...activityData,
        };

        await cacheService.set(sessionKey, updatedSession, this.SESSION_EXPIRY);
        await cacheService.sadd(
          this.ACTIVE_USERS_KEY,
          userId,
          this.SESSION_EXPIRY
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Update activity error:", error);
      return false;
    }
  }

  /**
   * إنهاء جلسة المستخدم
   */
  async endSession(userId) {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${userId}`;
      await cacheService.del(sessionKey);

      // إزالة من قائمة المستخدمين النشطين
      const activeUsers = await cacheService.smembers(this.ACTIVE_USERS_KEY);
      const filteredUsers = activeUsers.filter((user) => user !== userId);

      await cacheService.del(this.ACTIVE_USERS_KEY);
      if (filteredUsers.length > 0) {
        for (const user of filteredUsers) {
          await cacheService.sadd(
            this.ACTIVE_USERS_KEY,
            user,
            this.SESSION_EXPIRY
          );
        }
      }

      console.log(`✅ Session ended for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("End session error:", error);
      return false;
    }
  }

  /**
   * الحصول على معلومات الجلسة
   */
  async getSession(userId) {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${userId}`;
      return await cacheService.get(sessionKey);
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  }

  /**
   * الحصول على عدد المستخدمين النشطين
   */
  async getActiveUsersCount() {
    try {
      const activeUsers = await cacheService.smembers(this.ACTIVE_USERS_KEY);
      return activeUsers.length;
    } catch (error) {
      console.error("Get active users count error:", error);
      return 0;
    }
  }

  /**
   * الحصول على قائمة المستخدمين النشطين
   */
  async getActiveUsers() {
    try {
      return await cacheService.smembers(this.ACTIVE_USERS_KEY);
    } catch (error) {
      console.error("Get active users error:", error);
      return [];
    }
  }

  /**
   * تنظيف الجلسات المنتهية الصلاحية
   */
  async cleanExpiredSessions() {
    try {
      const activeUsers = await cacheService.smembers(this.ACTIVE_USERS_KEY);
      const validUsers = [];

      for (const userId of activeUsers) {
        const sessionKey = `${this.SESSION_PREFIX}${userId}`;
        const sessionExists = await cacheService.exists(sessionKey);

        if (sessionExists) {
          validUsers.push(userId);
        }
      }

      // إعادة بناء قائمة المستخدمين النشطين
      await cacheService.del(this.ACTIVE_USERS_KEY);
      for (const userId of validUsers) {
        await cacheService.sadd(
          this.ACTIVE_USERS_KEY,
          userId,
          this.SESSION_EXPIRY
        );
      }

      const cleanedCount = activeUsers.length - validUsers.length;
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired sessions`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("Clean expired sessions error:", error);
      return 0;
    }
  }

  /**
   * إحصائيات الجلسات
   */
  async getSessionStats() {
    try {
      const activeUsersCount = await this.getActiveUsersCount();
      const activeUsers = await this.getActiveUsers();

      // الحصول على معلومات الجلسات النشطة
      const sessionPromises = activeUsers.map((userId) =>
        this.getSession(userId)
      );
      const sessions = await Promise.all(sessionPromises);
      const validSessions = sessions.filter((session) => session !== null);

      // حساب متوسط مدة الجلسة
      const now = new Date();
      const sessionDurations = validSessions.map((session) => {
        const createdAt = new Date(session.createdAt);
        return Math.floor((now - createdAt) / 1000 / 60); // بالدقائق
      });

      const averageSessionDuration =
        sessionDurations.length > 0
          ? sessionDurations.reduce((sum, duration) => sum + duration, 0) /
            sessionDurations.length
          : 0;

      return {
        activeUsers: activeUsersCount,
        totalSessions: validSessions.length,
        averageSessionDuration: Math.round(averageSessionDuration),
        generatedAt: now.toISOString(),
      };
    } catch (error) {
      console.error("Get session stats error:", error);
      return {
        activeUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * تتبع نشاط المستخدم (middleware helper)
   */
  trackUserActivity(req, res, next) {
    if (req.user?.id) {
      const activityData = {
        path: req.path,
        method: req.method,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      };

      // تحديث النشاط بشكل غير متزامن
      this.updateActivity(req.user.id, activityData).catch((err) =>
        console.error("Track activity error:", err)
      );
    }

    next();
  }
}

// إنشاء instance واحد للتطبيق
const sessionService = new SessionService();

export default sessionService;

// تشغيل تنظيف الجلسات كل 5 دقائق
setInterval(() => {
  sessionService.cleanExpiredSessions();
}, 5 * 60 * 1000);
