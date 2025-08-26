/**
 * @swagger
 * /api/booking/create-secure-booking:
 *   post:
 *     summary: إنشاء حجز آمن جديد
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCreate'
 *           example:
 *             ticketId: "507f1f77bcf86cd799439016"
 *             eventId: "507f1f77bcf86cd799439014"
 *             type: "regular"
 *             quantity: 2
 *             paymentMethod: "card"
 *     responses:
 *       201:
 *         description: تم إنشاء الحجز بنجاح - في انتظار الدفع
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
 *                   example: "تم إنشاء الحجز بنجاح، يرجى إتمام عملية الدفع"
 *                 booking:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439017"
 *                     bookingCode:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     totalPrice:
 *                       type: number
 *                       example: 599.98
 *                     currency:
 *                       type: string
 *                       example: "EGP"
 *                     status:
 *                       type: string
 *                       example: "pending_payment"
 *                 paymentDetails:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     amount:
 *                       type: number
 *                       example: 59998
 *                     currency:
 *                       type: string
 *                       example: "EGP"
 *                     description:
 *                       type: string
 *                       example: "تذكرة مؤتمر التكنولوجيا 2024 - regular"
 *                     customer:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "تم حجز التذاكر مؤقتاً لمدة 15 دقيقة"
 *                     - "يرجى إتمام عملية الدفع لتأكيد الحجز"
 *                     - "في حالة عدم الدفع خلال 15 دقيقة، سيتم إلغاء الحجز تلقائياً"
 *       400:
 *         description: خطأ في البيانات أو التذاكر غير متاحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidData:
 *                 summary: بيانات غير صحيحة
 *                 value:
 *                   success: false
 *                   message: "فشل في إنشاء الحجز"
 *                   error: "الكمية المطلوبة غير متاحة"
 *               soldOut:
 *                 summary: نفدت التذاكر
 *                 value:
 *                   success: false
 *                   message: "عدد التذاكر المتاحة: 1 فقط"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: الحدث أو التذكرة غير موجودة
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/cancel-pending/{bookingId}:
 *   delete:
 *     summary: إلغاء حجز مؤقت
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحجز المراد إلغاؤه
 *     responses:
 *       200:
 *         description: تم إلغاء الحجز بنجاح
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
 *                   example: "تم إلغاء الحجز بنجاح"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: الحجز غير موجود أو لا يمكن إلغاؤه
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "الحجز غير موجود أو لا يمكن إلغاؤه"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/status/{bookingId}:
 *   get:
 *     summary: التحقق من حالة الحجز
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحجز
 *     responses:
 *       200:
 *         description: تم الحصول على حالة الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439017"
 *                     bookingCode:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, cancelled, expired]
 *                       example: "confirmed"
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, processing, completed, failed, refunded, expired]
 *                       example: "completed"
 *                     totalPrice:
 *                       type: number
 *                       example: 599.98
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     qrCode:
 *                       type: string
 *                       description: QR Code Data URL (متاح فقط للحجوزات المؤكدة)
 *                       example: "data:image/png;base64,..."
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *                     attendeeInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                 payment:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     status:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/my-bookings:
 *   get:
 *     summary: الحصول على جميع حجوزات المستخدم
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, expired]
 *         description: تصفية حسب حالة الحجز
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded, expired]
 *         description: تصفية حسب حالة الدفع
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
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, totalPrice]
 *           default: createdAt
 *         description: ترتيب حسب
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: اتجاه الترتيب
 *     responses:
 *       200:
 *         description: تم الحصول على الحجوزات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bookings:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Booking'
 *                       - type: object
 *                         properties:
 *                           event:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                               endDate:
 *                                 type: string
 *                                 format: date-time
 *                               location:
 *                                 type: object
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               category:
 *                                 type: string
 *                           ticket:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               currency:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/book-ticket:
 *   post:
 *     summary: حجز تذكرة (الطريقة التقليدية - للتوافق)
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     deprecated: true
 *     description: هذه الطريقة مُهملة، يُنصح باستخدام create-secure-booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId, eventId, type, quantity]
 *             properties:
 *               ticketId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439016"
 *               eventId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *               type:
 *                 type: string
 *                 example: "regular"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 2
 *     responses:
 *       201:
 *         description: تم إنشاء الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking confirmed"
 *                 bookingId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439017"
 *                 totalPrice:
 *                   type: number
 *                   example: 599.98
 *       400:
 *         description: خطأ في البيانات
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/organizer/bookings:
 *   get:
 *     summary: الحصول على جميع حجوزات أحداث المنظم
 *     tags: [📝 Bookings]
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
 *           maximum: 100
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, expired]
 *         description: تصفية حسب حالة الحجز
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded, expired]
 *         description: تصفية حسب حالة الدفع
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: البحث في رمز الحجز أو اسم العميل أو البريد الإلكتروني
 *     responses:
 *       200:
 *         description: تم الحصول على الحجوزات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Booking'
 *                       - type: object
 *                         properties:
 *                           event:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                               endDate:
 *                                 type: string
 *                                 format: date-time
 *                               location:
 *                                 type: object
 *                               category:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               userName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           ticket:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               currency:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية منظم
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/organizer/bookings/{bookingId}:
 *   get:
 *     summary: الحصول على تفاصيل حجز محدد (منظمون فقط)
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحجز
 *     responses:
 *       200:
 *         description: تم الحصول على تفاصيل الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Booking'
 *                     - type: object
 *                       properties:
 *                         event:
 *                           type: object
 *                           properties:
 *                             title:
 *                               type: string
 *                             description:
 *                               type: string
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *                             time:
 *                               type: string
 *                             location:
 *                               type: object
 *                             category:
 *                               type: string
 *                             images:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             organizer:
 *                               type: string
 *                             maxAttendees:
 *                               type: integer
 *                         user:
 *                           type: object
 *                           properties:
 *                             userName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                         ticket:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                             price:
 *                               type: number
 *                             currency:
 *                               type: string
 *                             description:
 *                               type: string
 *                             features:
 *                               type: array
 *                               items:
 *                                 type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: غير مصرح بالوصول
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/organizer/bookings/{bookingId}/status:
 *   put:
 *     summary: تحديث حالة الحجز (منظمون فقط)
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحجز
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: تم تحديث حالة الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking confirmed successfully"
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: حالة غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid status. Must be: pending, confirmed, or cancelled"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: غير مصرح بالوصول
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/organizer/bookings/stats:
 *   get:
 *     summary: الحصول على إحصائيات الحجوزات للمنظم
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: تصفية حسب حدث محدد
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: تاريخ البداية للإحصائيات
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: تاريخ النهاية للإحصائيات
 *     responses:
 *       200:
 *         description: تم الحصول على الإحصائيات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBookings:
 *                   type: integer
 *                   example: 150
 *                 totalRevenue:
 *                   type: number
 *                   example: 45000.00
 *                 confirmedBookings:
 *                   type: integer
 *                   example: 120
 *                 pendingBookings:
 *                   type: integer
 *                   example: 20
 *                 cancelledBookings:
 *                   type: integer
 *                   example: 10
 *                 recentBookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       bookingCode:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       event:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية منظم
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/organizer/events/{eventId}/bookings:
 *   get:
 *     summary: الحصول على حجوزات حدث معين
 *     tags: [📝 Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
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
 *           maximum: 100
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, expired]
 *         description: تصفية حسب حالة الحجز
 *     responses:
 *       200:
 *         description: تم الحصول على حجوزات الحدث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                 bookings:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Booking'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               userName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           ticket:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               currency:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: غير مصرح بالوصول
 *       404:
 *         description: الحدث غير موجود أو غير مصرح بالوصول
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
