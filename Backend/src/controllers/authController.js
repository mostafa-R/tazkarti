import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { generateToken } from "../utils/jwt.js";

//local register from default form for user

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, address } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    const existEmail = await User.findOne({ email });

    if (existEmail) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const existPhone = await User.findOne({ phone });
    if (existPhone) {
      return res.status(400).json({ error: "Phone number already exists." });
    }

    const allawedFields = [
      "name",
      "email",
      "password",
      "avatar",
      "bio",
      "phone",
      "provider",
      "address",
    ];

    const userData = {};
    allawedFields.forEach((field) => {
      if (field in req.body) {
        userData[field] = req.body[field];
      }
    });

    if (address && typeof address === "object") {
      const { country, city, street, zip } = address;

      userData.address = { country, city, street, zip };
    }

    const verificationCode = crypto
      .randomInt(100000, 999999)
      .toString()
      .padStart(6, "0");

    userData.emailVerificationCode = await bcrypt.hash(verificationCode, 10);
    userData.expireVerificationAt = new Date(Date.now() + 10 * 60 * 1000);
    userData.role = "user";

    const user = new User(userData);
    await user.save();

    //send verification email
    const emailResult = await sendEmail(
      user.email,
      "Verify Your Email",
      `Your verification code is: ${verificationCode}`,
      `<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Welcome to Our App 👋</h2>
      <p style="color: #555; font-size: 16px;">Thank you for registering. Please use the following verification code to verify your email:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 3px;">
          ${verificationCode}
        </span>
      </div>
      <p style="color: #888; font-size: 14px;">This code will expire in 10 minutes.</p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  </div>`
    );

    if (!emailResult.success) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    res.status(201).json({
      message: "User registered. Please verify your email.",
    });
  } catch (error) {
    console.log("Register Error:", error.message);
    next(error);
  }
};

///register from default form for organizer
export const registerOrganizer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      organizationName,
      organizationDescription,
      address,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    const existEmail = await User.findOne({ email });

    if (existEmail) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const existPhone = await User.findOne({ phone });
    if (existPhone) {
      return res.status(400).json({ error: "Phone number already exists." });
    }

    const allawedFields = [
      "name",
      "email",
      "password",
      "avatar",
      "bio",
      "phone",
      "provider",
      "address",
      "organizationName",
      "organizationDescription",
    ];

    const userData = {};
    allawedFields.forEach((field) => {
      if (field in req.body) {
        userData[field] = req.body[field];
      }
    });

    if (address && typeof address === "object") {
      const { country, city, street, zip } = address;
      if (!country || !city || !street || !zip) {
        return res.status(400).json({
          error:
            "All address fields (country, city, street, zip) are required.",
        });
      }
      userData.address = { country, city, street, zip };
    }

    const verificationCode = crypto
      .randomInt(100000, 999999)
      .toString()
      .padStart(6, "0");

    userData.emailVerificationCode = await bcrypt.hash(verificationCode, 10);
    userData.expireVerificationAt = new Date(Date.now() + 10 * 60 * 1000);
    userData.role = "organizer";

    const user = new User(userData);
    await user.save();

    //send verification email
    const emailResult = await sendEmail(
      user.email,
      "Verify Your Email",
      `Your verification code is: ${verificationCode}`,
      `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
    );

    if (!emailResult.success) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    res.status(201).json({
      message: "Organize Added Successfully. Please verify your email.",
    });
  } catch (error) {
    console.log("Register Error:", error.message);
    next(error);
  }
};

//verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.verified) {
      return res.status(400).json({ error: "User is already verified." });
    }

    const isMatch = await bcrypt.compare(code, user.emailVerificationCode);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    user.verified = true;
    user.emailVerificationCode = null;
    user.expireVerificationAt = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
};

//************************ */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account has no password. Try logging in with Google.",
      });
    }

    const hashedPassword = await bcrypt.compare(password, user.password);

    if (!hashedPassword) {
      return res.status(404).json({ message: "invalid password or Email" });
    }

    const token = generateToken(user, res);

    const { password: pwd, ...userData } = user.toObject();
    res.status(200).json({ userData, token });
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const logout = (req, res) => {
  try {
    Object.keys(req.cookies || {}).forEach((cookie) => {
      res.clearCookie(cookie, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
    });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res
            .status(500)
            .json({ message: "Logout failed (session error)" });
        }

        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Logout successful" });
      });
    } else {
      return res.status(200).json({ message: "Logout successful" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
};
