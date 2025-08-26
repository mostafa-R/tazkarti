/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: الحصول على جميع الأحداث (عام)
 *     tags: [🎭 Events]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technology, business, entertainment, sports, education, health]
 *         description: تصفية حسب الفئة
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: البحث في العنوان والوصف
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: البحث حسب الموقع
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: تاريخ البداية للتصفية
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: تاريخ النهاية للتصفية
 *     responses:
 *       200:
 *         description: تم الحصول على الأحداث بنجاح
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
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/upcoming:
 *   get:
 *     summary: الحصول على الأحداث القادمة
 *     tags: [🎭 Events]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: عدد الأحداث المطلوبة
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: تصفية حسب الفئة
 *     responses:
 *       200:
 *         description: تم الحصول على الأحداث القادمة بنجاح
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
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: الحصول على تفاصيل حدث محدد
 *     tags: [🎭 Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
 *     responses:
 *       200:
 *         description: تم الحصول على تفاصيل الحدث بنجاح
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
 *                     - $ref: '#/components/schemas/Event'
 *                     - type: object
 *                       properties:
 *                         tickets:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Ticket'
 *                         organizer:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             userName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             avatar:
 *                               type: string
 *       404:
 *         description: الحدث غير موجود
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "الحدث غير موجود"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/create:
 *   post:
 *     summary: إنشاء حدث جديد (منظمون فقط)
 *     tags: [🎭 Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, startDate, endDate, location]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "مؤتمر التكنولوجيا 2024"
 *               description:
 *                 type: string
 *                 example: "مؤتمر تقني يجمع أفضل المطورين في المنطقة"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-15T10:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-15T18:00:00Z"
 *               location:
 *                 type: string
 *                 example: "مركز الرياض الدولي للمؤتمرات"
 *               category:
 *                 type: string
 *                 enum: [technology, business, entertainment, sports, education, health]
 *                 example: "technology"
 *               maxAttendees:
 *                 type: integer
 *                 minimum: 1
 *                 example: 500
 *               tags:
 *                 type: string
 *                 description: Tags separated by commas
 *                 example: "تقنية,برمجة,ذكي_اصطناعي"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: صور الحدث (حد أقصى 5 صور)
 *     responses:
 *       201:
 *         description: تم إنشاء الحدث بنجاح
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
 *                   example: "تم إنشاء الحدث بنجاح"
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لإنشاء الأحداث
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "يجب أن تكون منظماً لإنشاء الأحداث"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: تحديث حدث (منظم الحدث أو مدير)
 *     tags: [🎭 Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "مؤتمر التكنولوجيا المحدث 2024"
 *               description:
 *                 type: string
 *                 example: "وصف محدث للمؤتمر"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technology, business, entertainment, sports, education, health]
 *               maxAttendees:
 *                 type: integer
 *                 minimum: 1
 *               tags:
 *                 type: string
 *                 description: Tags separated by commas
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: صور جديدة للحدث
 *     responses:
 *       200:
 *         description: تم تحديث الحدث بنجاح
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
 *                   example: "تم تحديث الحدث بنجاح"
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لتحديث هذا الحدث
 *       404:
 *         description: الحدث غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: حذف حدث (منظم الحدث أو مدير)
 *     tags: [🎭 Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحدث
 *     responses:
 *       200:
 *         description: تم حذف الحدث بنجاح
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
 *                   example: "تم حذف الحدث بنجاح"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية لحذف هذا الحدث
 *       404:
 *         description: الحدث غير موجود
 *       409:
 *         description: لا يمكن حذف الحدث لوجود حجوزات
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "لا يمكن حذف الحدث لوجود حجوزات مؤكدة"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/events/organizer/my-events:
 *   get:
 *     summary: الحصول على أحداث المنظم (منظمون فقط)
 *     tags: [🎭 Events]
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
 *           enum: [draft, published, cancelled, completed]
 *         description: تصفية حسب الحالة
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: تصفية حسب الفئة
 *     responses:
 *       200:
 *         description: تم الحصول على أحداث المنظم بنجاح
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
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           bookingsCount:
 *                             type: integer
 *                             example: 25
 *                           totalRevenue:
 *                             type: number
 *                             example: 7500.00
 *                           soldTickets:
 *                             type: integer
 *                             example: 30
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
 * /api/events/admin:
 *   get:
 *     summary: الحصول على جميع الأحداث (مديرون ومنظمون)
 *     tags: [🎭 Events]
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
 *           enum: [draft, published, cancelled, completed]
 *         description: تصفية حسب الحالة
 *       - in: query
 *         name: organizer
 *         schema:
 *           type: string
 *         description: تصفية حسب المنظم
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: البحث في العنوان والوصف
 *     responses:
 *       200:
 *         description: تم الحصول على الأحداث بنجاح
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
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           organizer:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               userName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: ليس لديك صلاحية الوصول لهذه البيانات
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
