import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Ticket } from "../models/Ticket.js";
import { sendEmail } from "../services/emailService.js";
import QRCodeService from "../services/qrCodeService.js";
import { generateBookingConfirmationEmail } from "../utils/emailTemplates.js";
import logger from "../utils/logger.js"; // Add a proper logger

// ==================== Configuration ====================
const config = {
  isSandbox: (process.env.CKO_ENV || "sandbox") === "sandbox",
  baseUrl: {
    sandbox: "https://api.sandbox.checkout.com",
    production: "https://api.checkout.com",
  },
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
};

const requiredEnvVars = [
  { key: 'CKO_SECRET_KEY', description: 'Checkout.com Secret Key' },
  { key: 'CKO_PROCESSING_CHANNEL_ID', description: 'Checkout.com Processing Channel ID' },
  { key: 'APP_BASE_URL', description: 'Application Base URL for callbacks' }
];

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v.key]);
if (missingEnvVars.length > 0) {
  missingEnvVars.forEach(v => {
    logger.error(`[CKO Config] Missing environment variable: ${v.key} (${v.description})`);
  });
}

const BASE_URL = config.isSandbox
  ? config.baseUrl.sandbox
  : config.baseUrl.production;

// ==================== Axios Instance with Interceptors ====================
const cko = axios.create({
  baseURL: BASE_URL,
  headers: {

    Authorization: process.env.CKO_SECRET_KEY || '',
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "TazkartiApp/1.0.0",
  },
  timeout: config.timeout,
});

// Log connection info at startup (without exposing the full secret key)
if (process.env.CKO_SECRET_KEY) {
  const maskedKey = `${process.env.CKO_SECRET_KEY.substring(0, 8)}...${process.env.CKO_SECRET_KEY.substring(process.env.CKO_SECRET_KEY.length - 4)}`;
  logger.info(`[CKO] Connected to ${config.isSandbox ? 'sandbox' : 'production'} using key: ${maskedKey}`);
} else {
  logger.error('[CKO] Missing API key: CKO_SECRET_KEY is not defined in environment variables');
}

// Request interceptor for logging
cko.interceptors.request.use(
  (config) => {
    logger.debug(`[CKO API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error("[CKO API] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
cko.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = error.response.headers["retry-after"] || 1;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return cko(originalRequest);
    }

    logger.error("[CKO API] Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// ==================== Helper Functions ====================
const generateIdempotencyKey = () => {
  const key = uuidv4();
  logger.debug(`[PaymentService] Generated idempotency key: ${key}`);
  return {
    "Cko-Idempotency-Key": key,
    "Idempotency-Key": key
  };
};

const validateRequiredFields = (fields, data) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }
};

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class CheckoutError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "CheckoutError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ==================== Payment Service Class ====================
class PaymentService {
  static async processPaymentWithToken(paymentData) {
    const {
      token,
      amount,
      currency = "EGP",
      reference,
      customer,
      metadata = {},
      threeDS = true,
      success_url = `${process.env.APP_BASE_URL}/payment/success`,
      failure_url = `${process.env.APP_BASE_URL}/payment/failure`,
      capture = true,
    } = paymentData;

    validateRequiredFields(["token", "amount", "currency"], paymentData);


    const paymentAmount = Math.round(Number(amount));

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new ValidationError(`Invalid payment amount: ${amount}. Amount must be a positive number.`);
    }

    logger.debug(`[PaymentService] Processing payment with token: amount=${paymentAmount} currency=${currency}`);

    // Format customer data correctly - remove any undefined or null properties
    let formattedCustomer = undefined;
    if (customer) {
      formattedCustomer = {
        email: customer.email,
      };

      if (customer.name) formattedCustomer.name = customer.name;
      if (customer.phone) formattedCustomer.phone = customer.phone;
    }

    const requestBody = {
      source: {
        type: "token",
        token: String(token)
      },
      amount: paymentAmount,
      currency: String(currency).toUpperCase(),
      reference: String(reference || `REF_${Date.now()}`),
    };

    if (capture !== undefined) {
      requestBody.capture = Boolean(capture);
    }

    if (threeDS) {
      requestBody["3ds"] = { enabled: true };

      if (success_url) requestBody.success_url = String(success_url);
      if (failure_url) requestBody.failure_url = String(failure_url);
    }

    if (customer && customer.email) {
      requestBody.customer = { email: String(customer.email) };
      if (customer.name) requestBody.customer.name = String(customer.name);
    }

    if (metadata && Object.keys(metadata).length > 0) {
      requestBody.metadata = {};
      Object.keys(metadata).forEach(key => {
        requestBody.metadata[key] = String(metadata[key]);
      });
    }

    if (process.env.CKO_PROCESSING_CHANNEL_ID) {
      requestBody.processing_channel_id = process.env.CKO_PROCESSING_CHANNEL_ID;
    }

    try {
      logger.info("[PaymentService] Making payment request to Checkout.com", {
        url: `${BASE_URL}/payments`,
        amount: paymentAmount,
        currency: currency,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
      });

      logger.debug("[PaymentService] Payment request body: " + JSON.stringify(requestBody, null, 2));

      const { data } = await cko.post("/payments", requestBody, {
        headers: generateIdempotencyKey(),
      });

      return {
        id: data.id,
        status: data.status,
        approved: data.approved,
        requires_redirect: !!data?._links?.redirect?.href,
        redirect_url: data?._links?.redirect?.href || null,
        response_summary: data?.response_summary,
        reference: data?.reference,
      };
    } catch (error) {
      throw new CheckoutError(
        "Payment processing failed",
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  static async createHostedPaymentLink(linkData) {
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
      items = [],
    } = linkData;

    validateRequiredFields(["amount", "currency"], linkData);

    const requestBody = {
      amount,
      currency,
      reference: reference || `ref_${Date.now()}`,
      description,
      "3ds": { enabled: threeDS },
      success_url,
      failure_url,
      customer: customer || undefined,
      billing: this.buildBillingInfo(customer),
      metadata,
      products: this.buildProductsList(items),
    };

    try {
      const { data } = await cko.post("/payment-links", requestBody, {
        headers: generateIdempotencyKey(),
      });

      return {
        id: data.id,
        status: data.status,
        redirect_url: data?._links?.redirect?.href,
      };
    } catch (error) {
      throw new CheckoutError(
        "Payment link creation failed",
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  static buildBillingInfo(customer) {
    if (!customer) return undefined;

    return {
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
    };
  }

  static buildProductsList(items) {
    if (!items?.length) return undefined;

    return items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unit_price,
    }));
  }

  static async getPaymentDetails(paymentId) {
    try {
      const { data } = await cko.get(`/payments/${paymentId}`);
      return data;
    } catch (error) {
      throw new CheckoutError(
        "Failed to retrieve payment details",
        error.response?.status || 500,
        error.response?.data
      );
    }
  }
}

// ==================== Webhook Service ====================
class WebhookService {
  static verifySignature(rawBody, signature) {
    if (!signature || !process.env.CKO_WEBHOOK_SECRET) {
      return false;
    }

    const secret = process.env.CKO_WEBHOOK_SECRET;

    const hmacHex = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature === hmacHex) return true;

    const hmacBase64 = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    return signature === hmacBase64;
  }

  static async processWebhookEvent(event) {
    const eventType = event?.type;
    const paymentData = event?.data;

    logger.info(`[Webhook] Processing event: ${eventType}`, {
      paymentId: paymentData?.id,
      status: paymentData?.status,
      reference: paymentData?.reference,
    });

    const handlers = {
      payment_approved: this.handleSuccessfulPayment,
      payment_captured: this.handleSuccessfulPayment,
      payment_declined: this.handleFailedPayment,
      payment_cancelled: this.handleFailedPayment,
      payment_expired: this.handleFailedPayment,
      payment_pending: this.handlePendingPayment,
      refund_issued: this.handleRefund,
    };

    const handler = handlers[eventType];
    if (handler) {
      await handler.call(this, paymentData);
    } else {
      logger.warn(`[Webhook] Unhandled event type: ${eventType}`);
    }
  }

  static async handleSuccessfulPayment(paymentData) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const booking = await this.findBooking(paymentData, session);
        if (!booking) {
          throw new Error(`Booking not found for payment ${paymentData.id}`);
        }

        await this.updatePaymentRecord(
          paymentData,
          booking,
          "captured",
          session
        );
        await this.confirmBooking(booking, paymentData, session);
        await this.generateTicketQRCode(booking, session);
      });

      const booking = await this.findBooking(paymentData);
      if (booking) {
        await this.sendConfirmationEmail(booking);
      }

      logger.info(`[Payment Success] Processed payment ${paymentData.id}`);
    } catch (error) {
      logger.error("[Payment Success] Error:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async handleFailedPayment(paymentData) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const booking = await this.findBooking(paymentData, session);
        if (!booking) {
          logger.warn(`Booking not found for failed payment ${paymentData.id}`);
          return;
        }

        await this.updatePaymentRecord(paymentData, booking, "failed", session);
        await this.cancelBooking(booking, session);
        await this.restoreTicketInventory(booking, session);
      });

      logger.info(
        `[Payment Failed] Processed failed payment ${paymentData.id}`
      );
    } catch (error) {
      logger.error("[Payment Failed] Error:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async handlePendingPayment(paymentData) {
    try {
      const booking = await this.findBooking(paymentData);
      if (booking) {
        await Payment.findOneAndUpdate(
          { paymentId: paymentData.id },
          {
            status: "processing",
            webhookReceivedAt: new Date(),
          },
          { upsert: true }
        );
      }
      logger.info(
        `[Payment Pending] Updated payment ${paymentData.id} to processing`
      );
    } catch (error) {
      logger.error("[Payment Pending] Error:", error);
    }
  }

  static async handleRefund(refundData) {
    try {
      const payment = await Payment.findOne({
        paymentId: refundData.payment_id,
      }).populate("booking");

      if (!payment?.booking) {
        logger.warn(`Payment not found for refund ${refundData.payment_id}`);
        return;
      }

      const refundAmount = refundData.amount / 100;
      payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
      payment.refundDate = new Date();
      payment.status =
        payment.refundAmount >= payment.amount
          ? "refunded"
          : "partially_refunded";

      await payment.save();

      const booking = payment.booking;
      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      booking.refundAmount = payment.refundAmount;

      await booking.save();

      logger.info(`[Refund] Processed refund for booking ${booking._id}`);
    } catch (error) {
      logger.error("[Refund] Error:", error);
    }
  }

  static async findBooking(paymentData, session = null) {
    const query = {
      $or: [
        { bookingCode: paymentData.reference },
        { paymentOrderId: paymentData.id },
      ],
    };

    return Booking.findOne(query)
      .populate(["event", "ticket", "user"])
      .session(session);
  }

  static async updatePaymentRecord(paymentData, booking, status, session) {
    const paymentRecord = {
      booking: booking._id,
      user: booking.user._id,
      paymentId: paymentData.id,
      transactionId: paymentData.response?.reference,
      paymentMethod: paymentData.source?.scheme || "card",
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      status,
      gatewayResponse: {
        responseCode: paymentData.response_code,
        responseMessage: paymentData.response_summary,
        approvalCode: paymentData.response?.approval_code,
        rrn: paymentData.response?.rrn,
      },
      customerData: {
        email: paymentData.customer?.email || booking.attendeeInfo.email,
        phone: paymentData.customer?.phone || booking.attendeeInfo.phone,
        name: paymentData.customer?.name || booking.attendeeInfo.name,
      },
      cardData: this.extractCardData(paymentData.source),
      capturedAt: status === "captured" ? new Date() : undefined,
      failedAt: status === "failed" ? new Date() : undefined,
      webhookVerified: true,
      webhookReceivedAt: new Date(),
    };

    return Payment.findOneAndUpdate(
      { paymentId: paymentData.id },
      paymentRecord,
      { upsert: true, new: true, session }
    );
  }

  static extractCardData(source) {
    if (!source) return {};

    return {
      maskedPan: source.last4 ? `****${source.last4}` : null,
      brand: source.scheme,
      type: source.type,
    };
  }

  static async confirmBooking(booking, paymentData, session) {
    booking.status = "confirmed";
    booking.paymentStatus = "completed";
    booking.transactionId = paymentData.response?.reference;
    booking.paymentDate = new Date();

    return booking.save({ session });
  }

  static async cancelBooking(booking, session) {
    booking.status = "cancelled";
    booking.paymentStatus = "failed";

    return booking.save({ session });
  }

  static async generateTicketQRCode(booking, session) {
    if (booking.qrCode) return;

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
      eventLocation: booking.event.location?.address || booking.event.location,
    });

    booking.qrCode = qrData.qrCodeDataUrl;
    return booking.save({ session });
  }

  static async restoreTicketInventory(booking, session) {
    return Ticket.findByIdAndUpdate(
      booking.ticket._id,
      { $inc: { availableQuantity: booking.quantity } },
      { session }
    );
  }

  static async sendConfirmationEmail(booking) {
    try {
      const emailHtml = generateBookingConfirmationEmail(
        booking,
        booking.qrCode
      );

      await sendEmail(
        booking.attendeeInfo.email,
        `🎫 تأكيد حجز التذكرة - ${booking.event.title}`,
        `تم تأكيد حجزك بنجاح! رقم الحجز: ${booking.bookingCode}`,
        emailHtml
      );

      logger.info(`[Email] Confirmation sent to ${booking.attendeeInfo.email}`);
    } catch (error) {
      logger.error("[Email] Failed to send confirmation:", error);
    }
  }
}

// ==================== Controller Methods ====================

/**
 * Process payment with token from Checkout Frames
 */
export const payWithToken = async (req, res, next) => {
  try {
    const result = await PaymentService.processPaymentWithToken(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details,
      });
    }

    logger.error("[payWithToken] Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

/**
 * Create hosted payment link
 */
export const createPaymentLink = async (req, res, next) => {
  try {
    const result = await PaymentService.createHostedPaymentLink(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details,
      });
    }

    logger.error("[createPaymentLink] Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const result = await PaymentService.getPaymentDetails(paymentId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details,
      });
    }

    logger.error("[getPaymentDetails] Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

/**
 * Handle Checkout.com webhook
 */
export const checkoutWebhook = async (req, res) => {
  try {
    const signature =
      req.header("cko-signature") ||
      req.header("Cko-Signature") ||
      req.header("CKO-Signature");

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body || "", "utf8");


    const isValid = WebhookService.verifySignature(rawBody, signature);
    if (!isValid) {
      logger.warn("[Webhook] Invalid signature received");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Parse event
    const event = JSON.parse(rawBody.toString("utf8"));

    // Process event asynchronously
    setImmediate(async () => {
      try {
        await WebhookService.processWebhookEvent(event);
      } catch (error) {
        logger.error("[Webhook] Error processing event:", error);
      }
    });

    // Respond immediately
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error("[Webhook] Handler error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook handler failed",
    });
  }
};

// ==================== Additional Utility Controllers ====================

/**
 * Verify payment status (for frontend polling)
 */
export const verifyPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required",
      });
    }

    const booking = await Booking.findOne({ bookingCode: reference })
      .select("status paymentStatus")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    logger.error("[verifyPaymentStatus] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment status",
    });
  }
};

/**
 * Retry failed payment
 */
export const retryPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { token } = req.body;

    if (!bookingId || !token) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and token are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate([
      "event",
      "ticket",
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking is already confirmed",
      });
    }

    // Create new payment attempt
    const paymentData = {
      token,
      amount: booking.totalAmount * 100, // Convert to cents
      currency: booking.currency || "EGP",
      reference: booking.bookingCode,
      customer: {
        email: booking.attendeeInfo.email,
        name: booking.attendeeInfo.name,
        phone: booking.attendeeInfo.phone,
      },
      metadata: {
        bookingId: booking._id.toString(),
        eventId: booking.event._id.toString(),
        userId: booking.user.toString(),
        retryAttempt: true,
      },
    };

    const result = await PaymentService.processPaymentWithToken(paymentData);

    // Update booking with new payment order ID
    booking.paymentOrderId = result.id;
    await booking.save();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("[retryPayment] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retry payment",
    });
  }
};

/**
 * Cancel pending payment
 */
export const cancelPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId)
        .populate("ticket")
        .session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "confirmed") {
        throw new Error("Cannot cancel confirmed booking");
      }

      // Cancel booking
      booking.status = "cancelled";
      booking.paymentStatus = "cancelled";
      await booking.save({ session });

      // Restore ticket inventory
      await Ticket.findByIdAndUpdate(
        booking.ticket._id,
        { $inc: { availableQuantity: booking.quantity } },
        { session }
      );

      // Update payment record if exists
      await Payment.findOneAndUpdate(
        { booking: booking._id },
        {
          status: "cancelled",
          cancelledAt: new Date(),
        },
        { session }
      );
    });

    res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
    });
  } catch (error) {
    logger.error("[cancelPayment] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel payment",
    });
  } finally {
    await session.endSession();
  }
};

// ==================== Health Check ====================
export const checkoutHealthCheck = async (req, res) => {
  try {
    // Test Checkout.com API connectivity
    const testResponse = await cko
      .get("/", {
        timeout: 5000,
      })
      .catch(() => null);

    const isHealthy = !!testResponse;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      service: "checkout",
      environment: config.isSandbox ? "sandbox" : "production",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Health Check] Error:", error);
    res.status(503).json({
      success: false,
      service: "checkout",
      error: "Service unavailable",
    });
  }
};

export default {
  payWithToken,
  createPaymentLink,
  getPaymentDetails,
  checkoutWebhook,
  verifyPaymentStatus,
  retryPayment,
  cancelPayment,
  checkoutHealthCheck,
};
