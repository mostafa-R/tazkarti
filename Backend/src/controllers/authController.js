import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/jwt.js";

//local register from default form for user

export const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
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
      "firstName",
      "lastName",
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
      generateVerificationEmail(verificationCode)
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
      firstName,
      lastName,
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
      "firstName",
      "lastName",
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
      `Hi ${user.firstName}, Your verification code is: ${verificationCode}`,
      generateVerificationEmail(verificationCode)
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

    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required." });
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
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "the email or password is incorrect" });
    }

    const token = generateToken(user, res);
    
    res.status(200).json({ user , token });
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const logingoogle = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user, res);

    if (!token) {
      return res
        .status(404)
        .json({ message: "something went wrong, please try again" });
    }

    res.setItem.localstorge = "isLoggedIn", true
    
    res.redirect(`${process.env.FRONT_URL}/home`);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email }).select("+password +role");

    if (!admin) {
      return res.status(404).json({ message: "check your email and password" });
    }

    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have admin permissions to access" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "the email or password is incorrect" });
    }

    const token = generateToken(admin, res);

    const { password: pwd, ...adminData } = admin.toObject();

    res.status(200).json({ admin: adminData, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ error: "Server error during login" });
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
