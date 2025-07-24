import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
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
      enum: ["credit_card", "paypal", "bank_transfer", "cash"],
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
        required: [true, "Attendee name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Attendee email is required"],
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, "Attendee phone is required"],
      }
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
    },
    refundReason: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//  للتحقق من صحة الحجز
bookingSchema.virtual('isValid').get(function() {
  return this.status === 'confirmed' && this.paymentStatus === 'completed';
});

// Generate booking code before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingCode) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingCode = `BK${timestamp}${random}`;
  }
  next();
});

// Index للبحث
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingCode: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ event: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);