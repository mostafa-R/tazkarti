import mongoose from "mongoose";

const archivedUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      min: [3, "Name must be at least 3 characters long"],
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9_-]{3,15}$/.test(value);
        },
        message:
          "Name must be between 3 and 15 characters long and contain only letters, numbers, underscores, and hyphens",
      },
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
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 300,
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
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
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
