// controllers/checkout.controller.js
import axios from "axios";
import crypto, { randomUUID } from "crypto";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import { sendEmail } from "../services/emailService.js";
import QRCodeService from "../services/qrCodeService.js";
import { generateBookingConfirmationEmail } from "../utils/emailTemplates.js";

const isSandbox = (process.env.CKO_ENV || "sandbox") === "sandbox";
const BASE_URL = isSandbox
  ? "https://api.sandbox.checkout.com"
  : "https://api.checkout.com";

const cko = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: process.env.CKO_SECRET_KEY, // Secret key
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Helper: Idempotency Header لكل طلب حسّاس
const idempotency = () => ({ "Cko-Idempotency-Key": randomUUID() });

// -------------- 1) دفع باستخدام Frames Token --------------
export const payWithToken = async (req, res) => {
  try {
    const {
      token, // من Checkout Frames في الفرونت (tok_xxx)
      amount, // بالمليم/السنت (مثلاً 26500 = 265.00 EGP)
      currency = "EGP",
      reference, // مرجع داخلي للحجز
      customer, // {email,name,phone}
      metadata = {}, // أي داتا إضافية (bookingId, userId ..)
      threeDS = true, // استحسن تفعيله
      success_url = `${process.env.APP_BASE_URL}/payment/success`,
      failure_url = `${process.env.APP_BASE_URL}/payment/failure`,
      capture = true, // true = Capture فوري, false = Authorize فقط
    } = req.body;

    if (!token || !amount || !currency) {
      return res
        .status(400)
        .json({ message: "token, amount, currency مطلوبين" });
    }

    const body = {
      source: {
        type: "token",
        token, // من Frames
      },
      amount,
      currency,
      reference: reference || `ref_${Date.now()}`,
      capture,
      "3ds": { enabled: !!threeDS },
      success_url,
      failure_url,
      customer: customer || undefined, // {email,name,phone}
      metadata,
      processing_channel_id: "pc_e47vukgralqelp6yq6qmujalwe", // pc_xxx
    };

    const { data } = await cko.post("/payments", body, {
      headers: idempotency(),
    });

    // لو محتاج Redirect للـ 3DS هتلاقيه في data._links.redirect.href
    return res.status(200).json({
      id: data.id,
      status: data.status, // Pending/Authorized/Captured/Declined
      approved: data.approved, // boolean
      requires_redirect: !!data?._links?.redirect?.href,
      redirect_url: data?._links?.redirect?.href || null,
      response_summary: data?.response_summary,
      reference: data?.reference,
    });
  } catch (err) {
    const data = err.response?.data;
    console.error("payWithToken error:", data || err.message);
    return res.status(500).json({
      message: "Checkout payWithToken failed",
      error: data || err.message,
    });
  }
};

// -------------- 2) إنشاء Hosted Payment Link (Redirect) --------------
export const createPaymentLink = async (req, res) => {
  try {
    const {
      amount,
      currency = "EGP",
      reference,
      customer,
      metadata = {},
      threeDS = true,
      success_url = `${process.env.APP_BASE_URL}/payment/success`,
      failure_url = `${process.env.APP_BASE_URL}/payment/failure`,
      description = "Ticket payment",
      items = [], // [{name,quantity,unit_price}] (اختياري)
    } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ message: "amount, currency مطلوبين" });
    }

    const body = {
      amount,
      currency,
      reference: reference || `ref_${Date.now()}`,
      description,
      "3ds": { enabled: !!threeDS },
      success_url,
      failure_url,
      customer: customer || undefined,
      billing: customer
        ? {
            address: {
              address_line1: customer.address_line1 || "NA",
              city: customer.city || "NA",
              country: customer.country || "EG",
            },
            phone: customer.phone
              ? {
                  country_code: customer.country_code || "20",
                  number: customer.phone,
                }
              : undefined,
          }
        : undefined,
      metadata,
      products: items?.length
        ? items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.unit_price, // بالمليم/السنت
          }))
        : undefined,
    };

    const { data } = await cko.post("/payment-links", body, {
      headers: idempotency(),
    });

    // Checkout بيرجع _links.self (API) و _links.redirect (URL للعميل)
    return res.status(200).json({
      id: data.id,
      status: data.status,
      redirect_url: data?._links?.redirect?.href, // وجّهه أو اعمله window.location
    });
  } catch (err) {
    const data = err.response?.data;
    console.error("createPaymentLink error:", data || err.message);
    return res.status(500).json({
      message: "Checkout createPaymentLink failed",
      error: data || err.message,
    });
  }
};

// -------------- 3) الاستعلام عن دفعة --------------
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { data } = await cko.get(`/payments/${paymentId}`);
    return res.status(200).json(data);
  } catch (err) {
    const data = err.response?.data;
    console.error("getPaymentDetails error:", data || err.message);
    return res.status(500).json({
      message: "Checkout getPaymentDetails failed",
      error: data || err.message,
    });
  }
};

// -------------- 4) Webhook + تحقق توقيع --------------
/**
 * ملاحظات مهمة:
 * - استقبل raw body في server.js (express.raw).
 * - Checkout يبعت هيدر: `cko-signature`
 * - التوقيع = HMAC SHA256 على الـ raw body باستخدام CKO_WEBHOOK_SECRET
 *   (بعض الحسابات بتستخدم base64، لكن hex هو الأكثر شيوعًا. لو فشل، جرّب base64).
 */
const verifyCkoSignature = (rawBody, signature) => {
  if (!signature) return false;
  const secret = process.env.CKO_WEBHOOK_SECRET;
  if (!secret) return false;

  // hex
  const hmacHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature === hmacHex) return true;

  // base64 fallback
  const hmacB64 = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  return signature === hmacB64;
};

export const checkoutWebhook = async (req, res) => {
  try {
    const signature = req.header("cko-signature"); // أو 'Cko-Signature'
    const raw = req.body; // Buffer (بسبب express.raw)

    const rawBody = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || "", "utf8");

    const valid = verifyCkoSignature(rawBody, signature);
    if (!valid) {
      console.error("[CKO Webhook] Invalid signature");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType = event?.type;
    const paymentData = event?.data;
    const paymentId = paymentData?.id;
    const status = paymentData?.status;
    const reference = paymentData?.reference;

    console.log(
      `[CKO Webhook] Received: ${eventType} for payment ${paymentId} with status ${status}`
    );

    // معالجة مختلف أنواع الأحداث
    switch (eventType) {
      case "payment_approved":
      case "payment_captured":
        await handleSuccessfulPayment(paymentData);
        break;

      case "payment_declined":
      case "payment_cancelled":
      case "payment_expired":
        await handleFailedPayment(paymentData);
        break;

      case "payment_pending":
        await handlePendingPayment(paymentData);
        break;

      case "refund_issued":
        await handleRefund(paymentData);
        break;

      default:
        console.log(`[CKO Webhook] Unhandled event type: ${eventType}`);
    }

    // لازم ترد 200 بسرعة (ما تعملش عمليات تقيلة هنا)
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("checkoutWebhook error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};

// ==================================================
// دوال معالجة حالات الدفع
// ==================================================

/**
 * معالجة الدفعة الناجحة
 */
async function handleSuccessfulPayment(paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      id: paymentId,
      reference,
      amount,
      currency,
      customer,
    } = paymentData;

    console.log(
      `[Payment Success] Processing payment ${paymentId} with reference ${reference}`
    );

    // البحث عن الحجز باستخدام المرجع
    const booking = await Booking.findOne({
      $or: [{ bookingCode: reference }, { paymentOrderId: paymentId }],
    })
      .populate(["event", "ticket", "user"])
      .session(session);

    if (!booking) {
      console.error(
        `[Payment Success] Booking not found for reference: ${reference}`
      );
      return;
    }

    // تحديث أو إنشاء سجل الدفعة
    let payment = await Payment.findOneAndUpdate(
      { paymentId },
      {
        booking: booking._id,
        user: booking.user._id,
        paymentId,
        transactionId: paymentData.response?.reference,
        paymentMethod: paymentData.source?.scheme || "card",
        amount: amount / 100, // تحويل من القروش
        currency,
        status: "captured",
        gatewayResponse: {
          responseCode: paymentData.response_code,
          responseMessage: paymentData.response_summary,
          approvalCode: paymentData.response?.approval_code,
          rrn: paymentData.response?.rrn,
        },
        customerData: {
          email: customer?.email || booking.attendeeInfo.email,
          phone: customer?.phone || booking.attendeeInfo.phone,
          name: customer?.name || booking.attendeeInfo.name,
        },
        cardData: paymentData.source
          ? {
              maskedPan: paymentData.source.last4
                ? `****${paymentData.source.last4}`
                : null,
              brand: paymentData.source.scheme,
              type: paymentData.source.type,
            }
          : {},
        capturedAt: new Date(),
        webhookVerified: true,
        webhookReceivedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        session,
      }
    );

    // تحديث حالة الحجز
    booking.status = "confirmed";
    booking.paymentStatus = "completed";
    booking.transactionId = paymentData.response?.reference;
    booking.paymentDate = new Date();

    // توليد QR Code للتذكرة
    if (!booking.qrCode) {
      const qrData = await QRCodeService.generateTicketQR({
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        eventId: booking.event._id,
        userId: booking.user._id,
        attendeeName: booking.attendeeInfo.name,
        attendeeEmail: booking.attendeeInfo.email,
        ticketType: booking.ticket.type,
        quantity: booking.quantity,
        eventDate: booking.event.startDate,
        eventTitle: booking.event.title,
        eventLocation:
          booking.event.location?.address || booking.event.location,
      });

      booking.qrCode = qrData.qrCodeDataUrl;
    }

    await booking.save({ session });

    // تأكيد خصم التذاكر (في حالة لم يتم خصمها من قبل)
    const ticket = await Ticket.findById(booking.ticket._id).session(session);
    if (ticket && ticket.availableQuantity < ticket.quantity) {
      // التذاكر مخصومة بالفعل، لا حاجة لعمل شيء
      console.log(
        `[Payment Success] Tickets already reserved for booking ${booking._id}`
      );
    }

    await session.commitTransaction();

    // إرسال إيميل التأكيد (خارج الـ transaction لتجنب التأخير)
    await sendBookingConfirmationEmail(booking, payment);

    console.log(
      `[Payment Success] Successfully processed payment ${paymentId} for booking ${booking._id}`
    );
  } catch (error) {
    await session.abortTransaction();
    console.error(
      "[Payment Success] Error processing successful payment:",
      error
    );
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * معالجة الدفعة الفاشلة
 */
async function handleFailedPayment(paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: paymentId, reference, amount, currency } = paymentData;

    console.log(
      `[Payment Failed] Processing failed payment ${paymentId} with reference ${reference}`
    );

    // البحث عن الحجز
    const booking = await Booking.findOne({
      $or: [{ bookingCode: reference }, { paymentOrderId: paymentId }],
    })
      .populate(["ticket"])
      .session(session);

    if (!booking) {
      console.error(
        `[Payment Failed] Booking not found for reference: ${reference}`
      );
      return;
    }

    // تحديث أو إنشاء سجل الدفعة
    await Payment.findOneAndUpdate(
      { paymentId },
      {
        booking: booking._id,
        user: booking.user,
        paymentId,
        amount: amount / 100,
        currency,
        status: "failed",
        gatewayResponse: {
          responseCode: paymentData.response_code,
          responseMessage: paymentData.response_summary,
        },
        failedAt: new Date(),
        webhookVerified: true,
        webhookReceivedAt: new Date(),
      },
      {
        upsert: true,
        session,
      }
    );

    // تحديث حالة الحجز
    booking.status = "cancelled";
    booking.paymentStatus = "failed";
    await booking.save({ session });

    // إعادة التذاكر إلى المخزون
    await Ticket.findByIdAndUpdate(
      booking.ticket._id,
      {
        $inc: { availableQuantity: booking.quantity },
      },
      { session }
    );

    await session.commitTransaction();

    console.log(
      `[Payment Failed] Successfully processed failed payment ${paymentId} for booking ${booking._id}`
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("[Payment Failed] Error processing failed payment:", error);
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * معالجة الدفعة المعلقة
 */
async function handlePendingPayment(paymentData) {
  try {
    const { id: paymentId, reference } = paymentData;

    console.log(
      `[Payment Pending] Processing pending payment ${paymentId} with reference ${reference}`
    );

    // البحث عن الحجز
    const booking = await Booking.findOne({
      $or: [{ bookingCode: reference }, { paymentOrderId: paymentId }],
    });

    if (booking) {
      // تحديث حالة الدفعة إلى processing
      await Payment.findOneAndUpdate(
        { paymentId },
        {
          status: "processing",
          webhookReceivedAt: new Date(),
        },
        { upsert: true }
      );

      console.log(
        `[Payment Pending] Updated payment status to processing for booking ${booking._id}`
      );
    }
  } catch (error) {
    console.error("[Payment Pending] Error processing pending payment:", error);
  }
}

/**
 * معالجة الاسترداد
 */
async function handleRefund(refundData) {
  try {
    const { payment_id: paymentId, amount, currency } = refundData;

    console.log(
      `[Refund] Processing refund for payment ${paymentId}, amount: ${amount}`
    );

    // البحث عن سجل الدفعة
    const payment = await Payment.findOne({ paymentId }).populate("booking");

    if (payment && payment.booking) {
      // تحديث سجل الدفعة
      payment.refundAmount += amount / 100;
      payment.refundDate = new Date();

      if (payment.refundAmount >= payment.amount) {
        payment.status = "refunded";
      } else {
        payment.status = "partially_refunded";
      }

      await payment.save();

      // تحديث الحجز
      const booking = payment.booking;
      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      booking.refundAmount = payment.refundAmount;
      await booking.save();

      console.log(
        `[Refund] Successfully processed refund for booking ${booking._id}`
      );
    }
  } catch (error) {
    console.error("[Refund] Error processing refund:", error);
  }
}

/**
 * إرسال إيميل تأكيد الحجز
 */
async function sendBookingConfirmationEmail(booking, payment) {
  try {
    // استخدام القالب المحسن الجديد
    const emailHtml = generateBookingConfirmationEmail(booking, booking.qrCode);

    await sendEmail(
      booking.attendeeInfo.email,
      `🎫 تأكيد حجز التذكرة - ${booking.event.title}`,
      `تم تأكيد حجزك بنجاح! رقم الحجز: ${booking.bookingCode}`,
      emailHtml
    );

    console.log(
      `[Email] Confirmation email sent to ${booking.attendeeInfo.email} for booking ${booking._id}`
    );
  } catch (error) {
    console.error("[Email] Error sending confirmation email:", error);
  }
}
