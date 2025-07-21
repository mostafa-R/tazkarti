import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    type: {
      type: String,
      required: [true, "Ticket type is required"],
      enum: ["standard", "vip", "premium", "student"],
      default: "standard",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1,
      default: 1,
    },
    availableQuantity: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.quantity;
        },
        message: "Available quantity cannot exceed total quantity",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    saleStartDate: {
      type: Date,
      default: Date.now,
    },
    saleEndDate: {
      type: Date,
      required: [true, "Sale end date is required"],
      validate: {
        validator: function (value) {
          return value > this.saleStartDate;
        },
        message: "Sale end date must be after sale start date",
      },
    },
    status: {
      type: String,
      enum: ["active", "sold_out", "sale_ended", "cancelled"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

ticketSchema.virtual("isSoldOut").get(function () {
  return this.availableQuantity <= 0;
});

ticketSchema.virtual("soldQuantity").get(function () {
  return this.quantity - this.availableQuantity;
});

ticketSchema.pre("save", function (next) {
  const now = new Date();

  if (this.availableQuantity <= 0) {
    this.status = "sold_out";
  } else if (now > this.saleEndDate) {
    this.status = "sale_ended";
  } else if (now >= this.saleStartDate && this.availableQuantity > 0) {
    this.status = "active";
  }

  next();
});

ticketSchema.index({ event: 1, type: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ status: 1, isActive: 1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);
