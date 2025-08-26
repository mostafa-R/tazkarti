/**
 * @swagger
 * /api/booking/checkout/pay-with-token:
 *   post:
 *     summary: الدفع باستخدام Checkout.com Token
 *     tags: [💳 Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, amount, reference, customer]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Checkout.com token من الفرونت اند
 *                 example: "tok_pmBhVdfCLaghqAuZqP2eGAhD"
 *               amount:
 *                 type: integer
 *                 description: المبلغ بالقروش/السنت
 *                 minimum: 100
 *                 example: 59998
 *               currency:
 *                 type: string
 *                 enum: [EGP, USD, EUR]
 *                 default: EGP
 *                 example: "EGP"
 *               reference:
 *                 type: string
 *                 description: رقم الحجز المرجعي
 *                 example: "BOOK-12345678"
 *               customer:
 *                 type: object
 *                 required: [email, name]
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "ahmed@example.com"
 *                   name:
 *                     type: string
 *                     example: "أحمد محمد"
 *                   phone:
 *                     type: string
 *                     example: "+201234567890"
 *               metadata:
 *                 type: object
 *                 properties:
 *                   bookingId:
 *                     type: string
 *                   eventId:
 *                     type: string
 *                   userId:
 *                     type: string
 *     responses:
 *       200:
 *         description: تم الدفع بنجاح
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
 *                   example: "تم الدفع بنجاح"
 *                 paymentData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pay_abc123def456"
 *                     status:
 *                       type: string
 *                       example: "Authorized"
 *                     amount:
 *                       type: integer
 *                       example: 59998
 *                     currency:
 *                       type: string
 *                       example: "EGP"
 *                     reference:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     customer:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                     response:
 *                       type: object
 *                       properties:
 *                         reference:
 *                           type: string
 *                         code:
 *                           type: string
 *                         summary:
 *                           type: string
 *                     source:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "card"
 *                         scheme:
 *                           type: string
 *                           example: "VISA"
 *                         last4:
 *                           type: string
 *                           example: "1234"
 *                         bin:
 *                           type: string
 *                           example: "424242"
 *       400:
 *         description: خطأ في بيانات الدفع
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: رمز غير صحيح
 *                 value:
 *                   success: false
 *                   message: "Invalid payment token"
 *                   error: "The token provided is invalid or expired"
 *               insufficientFunds:
 *                 summary: رصيد غير كافي
 *                 value:
 *                   success: false
 *                   message: "Payment declined"
 *                   error: "Insufficient funds"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/checkout/payment-link:
 *   post:
 *     summary: إنشاء رابط دفع مستضاف
 *     tags: [💳 Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, reference, customer, successUrl, failureUrl]
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: المبلغ بالقروش/السنت
 *                 minimum: 100
 *                 example: 59998
 *               currency:
 *                 type: string
 *                 enum: [EGP, USD, EUR]
 *                 default: EGP
 *                 example: "EGP"
 *               reference:
 *                 type: string
 *                 description: رقم الحجز المرجعي
 *                 example: "BOOK-12345678"
 *               customer:
 *                 type: object
 *                 required: [email, name]
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "ahmed@example.com"
 *                   name:
 *                     type: string
 *                     example: "أحمد محمد"
 *                   phone:
 *                     type: string
 *                     example: "+201234567890"
 *               successUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://tazkarti.com/booking/success?bookingId=BOOK-12345678"
 *               failureUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://tazkarti.com/booking/failed?bookingId=BOOK-12345678"
 *               description:
 *                 type: string
 *                 example: "دفعة لحجز تذكرة مؤتمر التكنولوجيا 2024"
 *               metadata:
 *                 type: object
 *                 properties:
 *                   bookingId:
 *                     type: string
 *                   eventId:
 *                     type: string
 *                   userId:
 *                     type: string
 *     responses:
 *       200:
 *         description: تم إنشاء رابط الدفع بنجاح
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
 *                   example: "تم إنشاء رابط الدفع بنجاح"
 *                 paymentLink:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pl_abc123def456"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://pay.checkout.com/link/pl_abc123def456"
 *                     expires_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-15T12:00:00Z"
 *                     reference:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     amount:
 *                       type: integer
 *                       example: 59998
 *                     currency:
 *                       type: string
 *                       example: "EGP"
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "انقر على الرابط لإتمام عملية الدفع"
 *                     - "الرابط صالح لمدة 30 دقيقة"
 *                     - "سيتم إرسال تأكيد الدفع عبر البريد الإلكتروني"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/checkout/{paymentId}:
 *   get:
 *     summary: الاستعلام عن حالة الدفعة
 *     tags: [💳 Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الدفعة من Checkout.com
 *         example: "pay_abc123def456"
 *     responses:
 *       200:
 *         description: تم الحصول على بيانات الدفعة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pay_abc123def456"
 *                     status:
 *                       type: string
 *                       enum: [Pending, Authorized, Captured, Declined, Cancelled, Expired]
 *                       example: "Captured"
 *                     amount:
 *                       type: integer
 *                       example: 59998
 *                     currency:
 *                       type: string
 *                       example: "EGP"
 *                     reference:
 *                       type: string
 *                       example: "BOOK-12345678"
 *                     customer:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                     source:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "card"
 *                         scheme:
 *                           type: string
 *                           example: "VISA"
 *                         last4:
 *                           type: string
 *                           example: "1234"
 *                     processed_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-15T10:30:00Z"
 *                     response:
 *                       type: object
 *                       properties:
 *                         code:
 *                           type: string
 *                           example: "10000"
 *                         summary:
 *                           type: string
 *                           example: "Approved"
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           processed_on:
 *                             type: string
 *                             format: date-time
 *                           amount:
 *                             type: integer
 *                           approved:
 *                             type: boolean
 *                           response:
 *                             type: object
 *                             properties:
 *                               code:
 *                                 type: string
 *                               summary:
 *                                 type: string
 *       404:
 *         description: الدفعة غير موجودة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "الدفعة غير موجودة"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/booking/checkout/webhook:
 *   post:
 *     summary: Webhook لاستقبال إشعارات الدفع من Checkout.com
 *     tags: [💳 Payments]
 *     description: |
 *       هذا الـ endpoint يستقبل إشعارات Checkout.com تلقائياً عند تغيير حالة الدفعة.
 *
 *       **مهم:** هذا endpoint للاستخدام الداخلي فقط من قبل Checkout.com ولا يجب استدعاؤه يدوياً.
 *
 *       ### أنواع الأحداث المدعومة:
 *       - `payment_approved` - تم اعتماد الدفعة
 *       - `payment_captured` - تم خصم المبلغ
 *       - `payment_declined` - تم رفض الدفعة
 *       - `payment_cancelled` - تم إلغاء الدفعة
 *       - `payment_expired` - انتهت صلاحية الدفعة
 *       - `payment_pending` - الدفعة قيد المعالجة
 *       - `refund_issued` - تم إصدار استرداد
 *
 *       ### التحقق من الأمان:
 *       يتم التحقق من التوقيع الرقمي باستخدام HMAC SHA256 لضمان صحة الإشعار.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *                 enum: [payment_approved, payment_captured, payment_declined, payment_cancelled, payment_expired, payment_pending, refund_issued]
 *                 example: "payment_captured"
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "pay_abc123def456"
 *                   status:
 *                     type: string
 *                     example: "Captured"
 *                   amount:
 *                     type: integer
 *                     example: 59998
 *                   currency:
 *                     type: string
 *                     example: "EGP"
 *                   reference:
 *                     type: string
 *                     example: "BOOK-12345678"
 *                   customer:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                   source:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       scheme:
 *                         type: string
 *                       last4:
 *                         type: string
 *                   response:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       summary:
 *                         type: string
 *                   processed_on:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       200:
 *         description: تم معالجة الإشعار بنجاح
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
 *                   example: "Webhook processed successfully"
 *                 eventType:
 *                   type: string
 *                   example: "payment_captured"
 *                 processed:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: إشعار غير صحيح أو توقيع غير صالح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidSignature:
 *                       summary: توقيع غير صحيح
 *                       value: "Invalid webhook signature"
 *                     invalidPayload:
 *                       summary: بيانات غير صحيحة
 *                       value: "Invalid webhook payload"
 *       500:
 *         description: خطأ في معالجة الإشعار
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error processing webhook"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
