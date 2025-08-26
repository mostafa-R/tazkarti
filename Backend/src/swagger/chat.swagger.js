/**
 * @swagger
 * /api/chat/ask:
 *   post:
 *     summary: طرح سؤال للمساعد الذكي
 *     tags: [💬 Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 description: السؤال أو الاستفسار
 *                 example: "ما هي الأحداث المتاحة في الرياض الأسبوع القادم؟"
 *               context:
 *                 type: object
 *                 description: سياق إضافي للسؤال
 *                 properties:
 *                   location:
 *                     type: string
 *                     example: "الرياض"
 *                   category:
 *                     type: string
 *                     example: "technology"
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       from:
 *                         type: string
 *                         format: date
 *                       to:
 *                         type: string
 *                         format: date
 *               conversationId:
 *                 type: string
 *                 description: معرف المحادثة للاستمرار في نفس السياق
 *                 example: "conv_abc123def456"
 *     responses:
 *       200:
 *         description: تم الحصول على الإجابة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   example: "يوجد 5 أحداث تقنية في الرياض الأسبوع القادم: مؤتمر التكنولوجيا، ورشة البرمجة، ..."
 *                 conversationId:
 *                   type: string
 *                   example: "conv_abc123def456"
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "أخبرني المزيد عن مؤتمر التكنولوجيا"
 *                     - "ما هي أسعار التذاكر؟"
 *                     - "كيف يمكنني الحجز؟"
 *                 relatedEvents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       location:
 *                         type: object
 *                       category:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     processingTime:
 *                       type: number
 *                       example: 1.2
 *                       description: وقت المعالجة بالثواني
 *                     tokensUsed:
 *                       type: integer
 *                       example: 150
 *                     confidence:
 *                       type: number
 *                       example: 0.95
 *                       description: مستوى الثقة في الإجابة
 *       400:
 *         description: خطأ في البيانات المرسلة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emptyQuestion:
 *                 summary: سؤال فارغ
 *                 value:
 *                   success: false
 *                   message: "السؤال مطلوب"
 *               tooLong:
 *                 summary: سؤال طويل جداً
 *                 value:
 *                   success: false
 *                   message: "السؤال طويل جداً، الحد الأقصى 1000 حرف"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: تم تجاوز حد الطلبات
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: الحصول على محادثات المستخدم
 *     tags: [💬 Chat]
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
 *     responses:
 *       200:
 *         description: تم الحصول على المحادثات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "conv_abc123def456"
 *                       title:
 *                         type: string
 *                         example: "أحداث الرياض"
 *                       lastMessage:
 *                         type: string
 *                         example: "ما هي الأحداث المتاحة في الرياض؟"
 *                       lastMessageAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-15T10:30:00Z"
 *                       messageCount:
 *                         type: integer
 *                         example: 5
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/chat/conversations/{conversationId}:
 *   get:
 *     summary: الحصول على تفاصيل محادثة محددة
 *     tags: [💬 Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المحادثة
 *         example: "conv_abc123def456"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: رقم الصفحة للرسائل
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: عدد الرسائل في الصفحة
 *     responses:
 *       200:
 *         description: تم الحصول على تفاصيل المحادثة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "conv_abc123def456"
 *                     title:
 *                       type: string
 *                       example: "أحداث الرياض"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     messageCount:
 *                       type: integer
 *                       example: 8
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [user, assistant]
 *                         example: "user"
 *                       content:
 *                         type: string
 *                         example: "ما هي الأحداث المتاحة في الرياض؟"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       metadata:
 *                         type: object
 *                         properties:
 *                           confidence:
 *                             type: number
 *                           processingTime:
 *                             type: number
 *                           relatedEvents:
 *                             type: array
 *                             items:
 *                               type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: المحادثة غير موجودة
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: حذف محادثة
 *     tags: [💬 Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المحادثة المراد حذفها
 *     responses:
 *       200:
 *         description: تم حذف المحادثة بنجاح
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
 *                   example: "تم حذف المحادثة بنجاح"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: المحادثة غير موجودة
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/chat/feedback:
 *   post:
 *     summary: تقييم إجابة المساعد الذكي
 *     tags: [💬 Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, messageId, rating]
 *             properties:
 *               conversationId:
 *                 type: string
 *                 example: "conv_abc123def456"
 *               messageId:
 *                 type: string
 *                 example: "msg_xyz789abc123"
 *               rating:
 *                 type: string
 *                 enum: [helpful, not_helpful, irrelevant]
 *                 example: "helpful"
 *               feedback:
 *                 type: string
 *                 description: تعليق اختياري
 *                 example: "الإجابة كانت مفيدة وشاملة"
 *               suggestions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: اقتراحات للتحسين
 *                 example: ["إضافة المزيد من التفاصيل عن الأسعار"]
 *     responses:
 *       200:
 *         description: تم حفظ التقييم بنجاح
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
 *                   example: "شكراً لك على تقييمك"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: المحادثة أو الرسالة غير موجودة
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/chat/suggestions:
 *   get:
 *     summary: الحصول على اقتراحات لأسئلة شائعة
 *     tags: [💬 Chat]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [events, booking, payment, account, general]
 *         description: فئة الاقتراحات
 *         example: "events"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: عدد الاقتراحات المطلوبة
 *     responses:
 *       200:
 *         description: تم الحصول على الاقتراحات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                         example: "ما هي الأحداث القادمة في الرياض؟"
 *                       category:
 *                         type: string
 *                         example: "events"
 *                       keywords:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["أحداث", "الرياض", "قادمة"]
 *                       popularity:
 *                         type: integer
 *                         example: 85
 *                         description: مدى شيوع السؤال (من 1 إلى 100)
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "events"
 *                       label:
 *                         type: string
 *                         example: "الأحداث والفعاليات"
 *                       count:
 *                         type: integer
 *                         example: 12
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
