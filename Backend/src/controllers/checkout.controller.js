// controllers/checkout.controller.js
import axios from "axios";
import crypto, { randomUUID } from "crypto";

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
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    // أمثلة للأحداث:
    // payment_approved, payment_captured, payment_declined, payment_voided, refund_issued ...

    const paymentId = event?.data?.id;
    const status = event?.data?.status;

    // TODO: هنا اربط مع نموذجك Booking/Ticket:
    // - لو status "Captured" → أكد الحجز / خصم التذاكر / أرسل كود التذكرة
    // - لو Declined/Expired → رجّع الكمية المتاحة … إلخ

    console.log("[CKO Webhook]", event.type, paymentId, status);

    // لازم ترد 200 بسرعة (ما تعملش عمليات تقيلة هنا)
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("checkoutWebhook error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};
