import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // ربط الدفعة بالحجز
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // ربط الدفعة بالمستخدم
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // بيانات من بوابة الدفع
    paymentId: {
      type: String, // معرف الدفعة من بوابة الدفع
      required: true,
      unique: true,
    },

    transactionId: {
      type: String, // معرف المعاملة من البنك
    },

    paymentMethod: {
      type: String,
      enum: [
        "card",
        "wallet",
        "bank_transfer",
        "fawry",
        "kiosk",
        "mobile_wallet",
      ],
    },

    // المبلغ والعملة
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["EGP", "USD", "EUR"],
      default: "EGP",
    },

    // حالة الدفعة
    status: {
      type: String,
      enum: [
        "pending", // في الانتظار
        "processing", // قيد المعالجة
        "authorized", // مُفوّضة (لم يتم الخصم النهائي)
        "captured", // تمت بنجاح (مخصومة)
        "failed", // فشلت
        "cancelled", // مُلغاة
        "expired", // منتهية الصلاحية
        "refunded", // مُسترَدة
        "partially_refunded", // مُسترَدة جزئياً
      ],
      default: "pending",
    },

    // تفاصيل الدفع
    gatewayResponse: {
      responseCode: String,
      responseMessage: String,
      approvalCode: String,
      rrn: String, // Retrieval Reference Number
    },

    // بيانات العميل
    customerData: {
      email: String,
      phone: String,
      name: String,
    },

    // بيانات البطاقة (مخفية/مشفرة)
    cardData: {
      maskedPan: String, // البطاقة المقنعة مثل 4**** **** **** 1234
      brand: String, // فيزا، ماستركارد، إلخ
      type: String, // debit, credit
    },

    // معلومات إضافية
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // تتبع الأحداث
    events: [
      {
        event: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],

    // تتبع الاسترداد
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
    },

    refundDate: {
      type: Date,
    },

    // التوقيتات المهمة
    authorizedAt: {
      type: Date,
    },

    capturedAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    expiredAt: {
      type: Date,
    },

    // معرف مرجعي للنظام الداخلي
    reference: {
      type: String,
      unique: true,
    },

    // بيانات النظام
    ipAddress: String,
    userAgent: String,

    // للتدقيق
    webhookVerified: {
      type: Boolean,
      default: false,
    },

    webhookReceivedAt: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual للتحقق من نجاح الدفعة
paymentSchema.virtual("isSuccessful").get(function () {
  return this.status === "captured";
});

// Virtual للتحقق من فشل الدفعة
paymentSchema.virtual("isFailed").get(function () {
  return ["failed", "cancelled", "expired"].includes(this.status);
});

// Virtual للتحقق من قابلية الاسترداد
paymentSchema.virtual("canRefund").get(function () {
  return this.status === "captured" && this.refundAmount < this.amount;
});

// توليد رقم مرجعي فريد
paymentSchema.pre("save", function (next) {
  if (!this.reference) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.reference = `PAY-${timestamp}-${random}`;
  }
  next();
});

// تحديث التوقيتات عند تغيير الحالة
paymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();

    switch (this.status) {
      case "authorized":
        if (!this.authorizedAt) this.authorizedAt = now;
        break;
      case "captured":
        if (!this.capturedAt) this.capturedAt = now;
        break;
      case "failed":
      case "cancelled":
        if (!this.failedAt) this.failedAt = now;
        break;
      case "expired":
        if (!this.expiredAt) this.expiredAt = now;
        break;
    }

    // إضافة حدث للتتبع
    this.events.push({
      event: `payment_${this.status}`,
      timestamp: now,
      data: {
        previousStatus: this._previousStatus,
        newStatus: this.status,
      },
    });
  }

  next();
});

// تتبع الحالة السابقة
paymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this._previousStatus = this.status;
  }
  next();
});

// فهارس للبحث والأداء
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
// paymentId and reference indexes already created by unique: true in field definitions
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ "events.event": 1, "events.timestamp": -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
