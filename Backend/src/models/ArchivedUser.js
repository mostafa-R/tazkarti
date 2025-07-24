import mongoose from "mongoose";

const archivedUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Name must be at least 3 characters long"],
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9_-]{3,15}$/.test(value);
        },
        message:
          "Name must be between 3 and 15 characters long and contain only letters, numbers, underscores, and hyphens",
      },
    },

    lastName: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Name must be at least 3 characters long"],
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9_-]{3,15}$/.test(value);
        },
        message:
          "Name must be between 3 and 15 characters long and contain only letters, numbers, underscores, and hyphens",
      },
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(value);
        },
        message: "Invalid email format",
      },
    },

    password: {
      type: String,
      select: false,
      validate: {
        validator: (value) => {
          return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(
            value
          );
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },

    profileImage: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: (value) => {
          return /^01[0-9]{9}$/.test(value);
        },
        message: "Invalid phone number format",
      },
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },

    address: {
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      street: { type: String, default: "" },
      zip: { type: String, default: "" },
    },

    // Customer-specific fields
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],

    // Email verification fields
    emailVerificationCode: {
      type: String,
      default: null,
    },

    expireVerificationAt: {
      type: Date,
      default: null,
      index: { expires: "10m" },
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // Social login fields
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      sparse: true,
    },

    // Organizer-specific fields
    organizationName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      default: null,
    },
    organizationDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    // Admin-specific fields
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],

    deletedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ArchivedUser = mongoose.model("ArchivedUser", archivedUserSchema);
export default ArchivedUser;
