/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: تسجيل مستخدم جديد
 *     tags: [🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           example:
 *             userName: "ahmed_mohamed"
 *             email: "ahmed@example.com"
 *             password: "password123"
 *             phone: "+201234567890"
 *             dateOfBirth: "1990-05-15"
 *             gender: "male"
 *     responses:
 *       201:
 *         description: تم التسجيل بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     email:
 *                       type: string
 *                       example: "ahmed@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: المستخدم موجود مسبقاً
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "البريد الإلكتروني مستخدم بالفعل"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/registerOrganizer:
 *   post:
 *     summary: تسجيل منظم فعاليات جديد
 *     tags: [🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UserRegistration'
 *               - type: object
 *                 properties:
 *                   companyName:
 *                     type: string
 *                     example: "شركة الأحداث الذكية"
 *                   businessType:
 *                     type: string
 *                     example: "event_management"
 *                   taxNumber:
 *                     type: string
 *                     example: "123456789"
 *           example:
 *             userName: "smart_events"
 *             email: "info@smartevents.com"
 *             password: "password123"
 *             phone: "+201234567890"
 *             companyName: "شركة الأحداث الذكية"
 *             businessType: "event_management"
 *     responses:
 *       201:
 *         description: تم تسجيل المنظم بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم إنشاء حساب المنظم بنجاح!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "organizer"
 *                     status:
 *                       type: string
 *                       example: "pending_approval"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: المنظم موجود مسبقاً
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/verifyOTP:
 *   post:
 *     summary: التحقق من البريد الإلكتروني برمز OTP
 *     tags: [🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: تم التحقق بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم التحقق من البريد الإلكتروني بنجاح"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: رمز OTP غير صحيح أو منتهي الصلاحية
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "رمز التحقق غير صحيح أو منتهي الصلاحية"
 *       404:
 *         description: المستخدم غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     tags: [🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "ahmed@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل الدخول بنجاح"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "refresh_eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-Only cookie for refresh token
 *             schema:
 *               type: string
 *               example: "refreshToken=refresh_token_here; HttpOnly; Secure; SameSite=Strict"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: بيانات دخول غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
 *       403:
 *         description: الحساب غير مفعل
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/adminlogin:
 *   post:
 *     summary: تسجيل دخول المدير
 *     tags: [🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "admin@tazkarti.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: تم تسجيل دخول المدير بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل دخول المدير بنجاح"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     adminDashboardUrl:
 *                       type: string
 *                       example: "/admin/dashboard"
 *       401:
 *         description: غير مصرح - ليس مديراً
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "غير مصرح بالوصول لوحة التحكم"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: تسجيل الخروج
 *     tags: [🔐 Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل الخروج بنجاح"
 *         headers:
 *           Set-Cookie:
 *             description: Clear refresh token cookie
 *             schema:
 *               type: string
 *               example: "refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: تسجيل الدخول عبر Google
 *     tags: [🔐 Authentication]
 *     description: يعيد توجيه المستخدم إلى صفحة تسجيل الدخول في Google
 *     responses:
 *       302:
 *         description: إعادة توجيه إلى Google OAuth
 *         headers:
 *           Location:
 *             description: Google OAuth authorization URL
 *             schema:
 *               type: string
 *               example: "https://accounts.google.com/oauth/authorize?..."
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: معالج رد نداء Google OAuth
 *     tags: [🔐 Authentication]
 *     description: يتم استدعاؤه تلقائياً من Google بعد المصادقة
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security
 *     responses:
 *       200:
 *         description: نجح تسجيل الدخول عبر Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "تم تسجيل الدخول عبر Google بنجاح"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     isNewUser:
 *                       type: boolean
 *                       example: false
 *       302:
 *         description: إعادة توجيه في حالة فشل المصادقة
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/auth/login"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
