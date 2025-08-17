import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import { Booking } from "../models/Booking.js";
import { Ticket } from "../models/Ticket.js";

dotenv.config();

// 1. خدمة PayMob - إعدادات الأساسية
export class PayMobService {
  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;

    // paymentMethod === "wallet"
    //  // ? process.env.PAYMOB_WALLET_INTEGRATION_ID
    //   : process.env.PAYMOB_CARD_INTEGRATION_ID;

    this.iframeId = process.env.PAYMOB_IFRAME_ID;
    this.hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    this.baseUrl = "https://accept.paymob.com/api";
  }

  //get token for authentication
  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });
      return response.data.token;
    } catch (error) {
      console.error("PayMob Authentication Error:", error.response?.data);
      throw new Error("Faild to Authenticate with PayMob");
    }
  }

  //creat order
  async createOrder(authToken, orderData) {
    try {
      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: orderData.amount_cents,
        currency: "EGP",
        items: orderData.items,
      });
      return response.data;
    } catch (error) {
      console.error("PayMob Create Order Error:", error.response?.data);
      throw new Error("Faild to Create Order with PayMob");
    }
  }

  // get payment key
  async getPaymentKey(authToken, orderId, billingData, amount) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: amount,
          expiration: 3600,
          order_id: orderId,
          billing_data: billingData,
          currency: "EGP",
          integration_id: this.integrationId,
        }
      );
      return response.data.token;
    } catch (error) {
      console.error(
        "PayMob Payment Key Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to Get Payment Key with PayMob");
    }
  }

  // Verify Webhook
  verifyWebhook(data, receivedHmac) {
    const orderId = data.order?.id || "";
    const created = data.created_at || "";
    const transactionId = data.id || "";
    const amount = data.amount_cents || "";
    const currency = data.currency || "";
    const success = data.success || "";

    const concatenatedString = `${amount}${currency}${success}${orderId}${created}${transactionId}${this.hmacSecret}`;
    const hash = crypto
      .createHmac("sha512", this.hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    return hash === receivedHmac;
  }
}


export const handlePayMobWebhook = async (req, res) => {
  try {
    const payMobService = new PayMobService();
    const receivedHmac = req.query.hmac;

    // التحقق من صحة Webhook
    if (!payMobService.verifyWebhook(req.body, receivedHmac)) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const { order, success, pending } = req.body;

    if (!order?.id) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const booking = await Booking.findOne({ paymentOrderId: order.id })
      .populate("ticket")
      .populate("event");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (success === true && pending === false) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "confirmed",
        paymentStatus: "completed",
        paymentDate: new Date(),
        transactionId: req.body.id,
      });

      console.log(`Payment successful for booking: ${booking._id}`);
    } else if (success === false && pending === false) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "cancelled",
        paymentStatus: "failed",
      });

      await Ticket.findByIdAndUpdate(booking.ticket._id, {
        $inc: { availableQuantity: booking.quantity },
      });

      console.log(`Payment failed for booking: ${booking._id}`);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate("event")
      .populate("ticket");

    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    return res.status(200).json({
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      event: booking.event,
      ticket: booking.ticket,
      quantity: booking.quantity,
      bookingCode: booking.bookingCode,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return res.status(500).json({
      message: "فشل في التحقق من حالة الدفع",
      error: error.message,
    });
  }
};

export const cancelExpiredBookings = async () => {
  try {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000);

    const expiredBookings = await Booking.find({
      status: "pending",
      paymentStatus: "pending",
      createdAt: { $lt: expiredTime },
    });

    for (const booking of expiredBookings) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: "cancelled",
        paymentStatus: "expired",
      });

      await Ticket.findByIdAndUpdate(booking.ticket, {
        $inc: { availableQuantity: booking.quantity },
      });
    }

    console.log(`Cancelled ${expiredBookings.length} expired bookings`);
  } catch (error) {
    console.error("Cancel expired bookings error:", error);
  }
};
