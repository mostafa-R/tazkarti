/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: الحصول على الملف الشخصي للمستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على الملف الشخصي بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         ticketsBooked:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               bookingCode:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               totalPrice:
 *                                 type: number
 *                               event:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                   startDate:
 *                                     type: string
 *                                     format: date-time
 *                                   images:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: تحديث الملف الشخصي للمستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 example: "ahmed_updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed.new@example.com"
 *               phone:
 *                 type: string
 *                 example: "+201234567890"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: صورة الملف الشخصي
 *               preferences:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     enum: [ar, en]
 *                     example: "ar"
 *                   notifications:
 *                     type: boolean
 *                     example: true
 *                   emailUpdates:
 *                     type: boolean
 *                     example: false
 *     responses:
 *       200:
 *         description: تم تحديث الملف الشخصي بنجاح
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
 *                   example: "تم تحديث الملف الشخصي بنجاح"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: البريد الإلكتروني أو اسم المستخدم مستخدم
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/change-password:
 *   put:
 *     summary: تغيير كلمة المرور
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *               confirmNewPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: تم تغيير كلمة المرور بنجاح
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
 *                   example: "تم تغيير كلمة المرور بنجاح"
 *       400:
 *         description: خطأ في البيانات
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               wrongPassword:
 *                 summary: كلمة المرور الحالية خاطئة
 *                 value:
 *                   success: false
 *                   message: "كلمة المرور الحالية غير صحيحة"
 *               passwordMismatch:
 *                 summary: كلمة المرور الجديدة غير متطابقة
 *                 value:
 *                   success: false
 *                   message: "كلمة المرور الجديدة وتأكيدها غير متطابقتين"
 *               weakPassword:
 *                 summary: كلمة المرور ضعيفة
 *                 value:
 *                   success: false
 *                   message: "كلمة المرور يجب أن تكون أقوى"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/delete-account:
 *   delete:
 *     summary: حذف الحساب
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmDeletion]
 *             properties:
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *               confirmDeletion:
 *                 type: boolean
 *                 example: true
 *                 description: يجب أن يكون true لتأكيد الحذف
 *               reason:
 *                 type: string
 *                 example: "لا أستخدم التطبيق بكثرة"
 *                 description: سبب اختياري لحذف الحساب
 *     responses:
 *       200:
 *         description: تم حذف الحساب بنجاح
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
 *                   example: "تم حذف الحساب بنجاح"
 *       400:
 *         description: خطأ في البيانات
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               wrongPassword:
 *                 summary: كلمة المرور خاطئة
 *                 value:
 *                   success: false
 *                   message: "كلمة المرور غير صحيحة"
 *               notConfirmed:
 *                 summary: لم يتم تأكيد الحذف
 *                 value:
 *                   success: false
 *                   message: "يجب تأكيد رغبتك في حذف الحساب"
 *               hasBookings:
 *                 summary: يوجد حجوزات نشطة
 *                 value:
 *                   success: false
 *                   message: "لا يمكن حذف الحساب لوجود حجوزات نشطة"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/notifications:
 *   get:
 *     summary: الحصول على إشعارات المستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: إظهار الإشعارات غير المقروءة فقط
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [booking, payment, event, general]
 *         description: تصفية حسب نوع الإشعار
 *     responses:
 *       200:
 *         description: تم الحصول على الإشعارات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439019"
 *                       title:
 *                         type: string
 *                         example: "تأكيد الحجز"
 *                       message:
 *                         type: string
 *                         example: "تم تأكيد حجزك لمؤتمر التكنولوجيا 2024"
 *                       type:
 *                         type: string
 *                         enum: [booking, payment, event, general]
 *                         example: "booking"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       data:
 *                         type: object
 *                         properties:
 *                           bookingId:
 *                             type: string
 *                           eventId:
 *                             type: string
 *                           action:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                       example: 25
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/notifications/{notificationId}/read:
 *   patch:
 *     summary: تحديد إشعار كمقروء
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الإشعار
 *     responses:
 *       200:
 *         description: تم تحديد الإشعار كمقروء
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
 *                   example: "تم تحديد الإشعار كمقروء"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: الإشعار غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/notifications/mark-all-read:
 *   patch:
 *     summary: تحديد جميع الإشعارات كمقروءة
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تحديد جميع الإشعارات كمقروءة
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
 *                   example: "تم تحديد جميع الإشعارات كمقروءة"
 *                 updatedCount:
 *                   type: integer
 *                   example: 12
 *                   description: عدد الإشعارات التي تم تحديثها
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/dashboard:
 *   get:
 *     summary: لوحة التحكم الخاصة بالمستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على بيانات لوحة التحكم بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         joinDate:
 *                           type: string
 *                           format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalBookings:
 *                           type: integer
 *                           example: 15
 *                         confirmedBookings:
 *                           type: integer
 *                           example: 12
 *                         totalSpent:
 *                           type: number
 *                           example: 3750.00
 *                         eventsAttended:
 *                           type: integer
 *                           example: 8
 *                         unreadNotifications:
 *                           type: integer
 *                           example: 3
 *                     recentBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           bookingCode:
 *                             type: string
 *                           status:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           event:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                     upcomingEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           bookingCode:
 *                             type: string
 *                           event:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                               location:
 *                                 type: object
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                           qrCode:
 *                             type: string
 *                             description: QR Code للدخول
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /user/preferences:
 *   get:
 *     summary: الحصول على تفضيلات المستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على التفضيلات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [ar, en]
 *                       example: "ar"
 *                     notifications:
 *                       type: boolean
 *                       example: true
 *                     emailUpdates:
 *                       type: boolean
 *                       example: false
 *                     eventCategories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["technology", "business"]
 *                     locationPreferences:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["الرياض", "جدة"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: تحديث تفضيلات المستخدم
 *     tags: [👤 Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [ar, en]
 *                 example: "ar"
 *               notifications:
 *                 type: boolean
 *                 example: true
 *               emailUpdates:
 *                 type: boolean
 *                 example: false
 *               eventCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [technology, business, entertainment, sports, education, health]
 *                 example: ["technology", "business"]
 *               locationPreferences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["الرياض", "جدة"]
 *     responses:
 *       200:
 *         description: تم تحديث التفضيلات بنجاح
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
 *                   example: "تم تحديث التفضيلات بنجاح"
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     notifications:
 *                       type: boolean
 *                     emailUpdates:
 *                       type: boolean
 *                     eventCategories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     locationPreferences:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
