/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: الحصول على جميع التذاكر
 *     tags: [🎟️ Tickets]
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
 *         name: event
 *         schema:
 *           type: string
 *         description: تصفية حسب الحدث
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [regular, vip, premium, student, early_bird]
 *         description: تصفية حسب نوع التذكرة
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, sold_out]
 *         description: تصفية حسب الحالة
 *     responses:
 *       200:
 *         description: تم الحصول على التذاكر بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Ticket'
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
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: إنشاء تذكرة جديدة (منظمون فقط)
 *     tags: [🎟️ Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event, type, price, quantity]
 *             properties:
 *               event:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *               type:
 *                 type: string
 *                 enum: [regular, vip, premium, student, early_bird]
 *                 example: "regular"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 299.99
 *               currency:
 *                 type: string
 *                 enum: [EGP, USD, EUR]
 *                 default: EGP
 *                 example: "EGP"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: "تذكرة عادية تتضمن الحضور والوجبات"
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["حضور جميع الجلسات", "وجبة غداء", "شهادة مشاركة"]
 *               saleStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               saleEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-14T23:59:59Z"
 *     responses:
 *       201:
 *         description: تم إنشاء التذكرة بنجاح
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
 *                   example: "تم إنشاء التذكرة بنجاح"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لإنشاء تذاكر لهذا الحدث
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: الحصول على تفاصيل تذكرة محددة
 *     tags: [🎟️ Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التذكرة
 *     responses:
 *       200:
 *         description: تم الحصول على تفاصيل التذكرة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Ticket'
 *                     - type: object
 *                       properties:
 *                         event:
 *                           $ref: '#/components/schemas/Event'
 *                         soldQuantity:
 *                           type: integer
 *                           example: 15
 *                           description: عدد التذاكر المباعة
 *       404:
 *         description: التذكرة غير موجودة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "التذكرة غير موجودة"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: تحديث تذكرة (منظم التذكرة فقط)
 *     tags: [🎟️ Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التذكرة
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [regular, vip, premium, student, early_bird]
 *               price:
 *                 type: number
 *                 minimum: 0
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               saleStartDate:
 *                 type: string
 *                 format: date-time
 *               saleEndDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold_out]
 *     responses:
 *       200:
 *         description: تم تحديث التذكرة بنجاح
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
 *                   example: "تم تحديث التذكرة بنجاح"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لتحديث هذه التذكرة
 *       404:
 *         description: التذكرة غير موجودة
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: حذف تذكرة (منظم التذكرة فقط)
 *     tags: [🎟️ Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التذكرة
 *     responses:
 *       200:
 *         description: تم حذف التذكرة بنجاح
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
 *                   example: "تم حذف التذكرة بنجاح"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لحذف هذه التذكرة
 *       404:
 *         description: التذكرة غير موجودة
 *       409:
 *         description: لا يمكن حذف التذكرة لوجود حجوزات
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "لا يمكن حذف التذكرة لوجود حجوزات عليها"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/tickets/event/{eventId}:
 *   get:
 *     summary: الحصول على تذاكر حدث محدد
 *     tags: [🎟️ Tickets]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: إظهار التذاكر النشطة فقط
 *     responses:
 *       200:
 *         description: تم الحصول على تذاكر الحدث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Ticket'
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
 *                           soldQuantity:
 *                             type: integer
 *                             description: عدد التذاكر المباعة
 *       404:
 *         description: لم توجد تذاكر لهذا الحدث
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No tickets found for this event"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/tickets/verify:
 *   get:
 *     summary: التحقق من صحة تذكرة عبر QR Code
 *     tags: [🎟️ Tickets]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: رمز QR المشفر من التذكرة
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: التذكرة صحيحة ومتاحة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "التذكرة صحيحة ومتاحة للاستخدام"
 *                 ticketInfo:
 *                   type: object
 *                   properties:
 *                     bookingCode:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     attendeeName:
 *                       type: string
 *                       example: "أحمد محمد"
 *                     attendeeEmail:
 *                       type: string
 *                       example: "ahmed@example.com"
 *                     eventTitle:
 *                       type: string
 *                       example: "مؤتمر التكنولوجيا 2024"
 *                     eventDate:
 *                       type: string
 *                       example: "الأحد، 15 يونيو 2024 10:00 ص"
 *                     eventLocation:
 *                       type: string
 *                       example: "مركز الرياض الدولي للمؤتمرات"
 *                     ticketType:
 *                       type: string
 *                       example: "regular"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                 bookingDetails:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     paymentStatus:
 *                       type: string
 *                       example: "completed"
 *                     checkedIn:
 *                       type: boolean
 *                       example: false
 *                     totalPrice:
 *                       type: number
 *                       example: 599.98
 *       400:
 *         description: التذكرة غير صحيحة أو منتهية الصلاحية
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     expired:
 *                       summary: منتهية الصلاحية
 *                       value: "التذكرة منتهية الصلاحية"
 *                     invalid:
 *                       summary: غير صحيحة
 *                       value: "توقيع غير صحيح - التذكرة قد تكون مزورة"
 *                     notFound:
 *                       summary: غير موجودة
 *                       value: "الحجز غير موجود في قاعدة البيانات"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/tickets/check-in:
 *   post:
 *     summary: تسجيل دخول حاضر باستخدام QR Code (منظمون فقط)
 *     tags: [🎟️ Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: رمز QR المشفر من التذكرة
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *                   example: "تم تسجيل دخول الحاضر بنجاح"
 *                 checkedInAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-06-15T08:30:00Z"
 *                 attendeeInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "أحمد محمد"
 *                     email:
 *                       type: string
 *                       example: "ahmed@example.com"
 *                     bookingCode:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     ticketType:
 *                       type: string
 *                       example: "regular"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: التذكرة غير صحيحة أو تم تسجيل الدخول مسبقاً
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     alreadyCheckedIn:
 *                       summary: تم تسجيل الدخول مسبقاً
 *                       value: "تم تسجيل دخول هذه التذكرة مسبقاً"
 *                     invalid:
 *                       summary: غير صحيحة
 *                       value: "التذكرة غير صحيحة أو منتهية الصلاحية"
 *                     unauthorized:
 *                       summary: غير مصرح
 *                       value: "غير مصرح لك بتسجيل دخول هذا الحدث"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية منظم
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/tickets/stats/{eventId}:
 *   get:
 *     summary: الحصول على إحصائيات تذاكر حدث (منظمون فقط)
 *     tags: [🎟️ Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
 *     responses:
 *       200:
 *         description: تم الحصول على الإحصائيات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 eventInfo:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "مؤتمر التكنولوجيا 2024"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     location:
 *                       type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalBookings:
 *                       type: integer
 *                       example: 85
 *                       description: إجمالي الحجوزات
 *                     confirmedBookings:
 *                       type: integer
 *                       example: 75
 *                       description: الحجوزات المؤكدة
 *                     checkedInBookings:
 *                       type: integer
 *                       example: 45
 *                       description: الحاضرين الفعليين
 *                     totalRevenue:
 *                       type: number
 *                       example: 22499.25
 *                       description: إجمالي الإيرادات
 *                     checkInRate:
 *                       type: string
 *                       example: "60.00"
 *                       description: معدل الحضور بالنسبة المئوية
 *                     ticketTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "regular"
 *                           soldCount:
 *                             type: integer
 *                             example: 50
 *                           revenue:
 *                             type: number
 *                             example: 14999.50
 *                           price:
 *                             type: number
 *                             example: 299.99
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 22499.25
 *                         currency:
 *                           type: string
 *                           example: "EGP"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لهذا الحدث
 *       404:
 *         description: الحدث غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
