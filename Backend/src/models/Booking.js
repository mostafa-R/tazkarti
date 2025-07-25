import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "cash", "wallet"],
      default: "credit_card",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    bookingCode: {
      type: String,
      unique: true,
      required: true,
    },
    attendeeInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"],
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^01[0-2,5]{1}[0-9]{8}$/, "Invalid Egyptian phone number"], // مثال
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    qrCode: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
      trim: true,
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

// ✅ Virtual للتحقق من صلاحية الحجز
bookingSchema.virtual("isValid").get(function () {
  return this.status === "confirmed" && this.paymentStatus === "completed";
});

// ✅ توليد كود الحجز بشكل ذكي
bookingSchema.pre("save", async function (next) {
  if (!this.bookingCode) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.bookingCode = `BK-${timestamp}-${random}`;
  }
  next();
});

// ✅ Indexes لتحسين البحث والأداء
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingCode: 1 }, { unique: true });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ event: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
