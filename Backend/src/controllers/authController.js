import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

//local register from default form for user

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

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
      // "address",
    ];

    const userData = {};
    allawedFields.forEach((field) => {
      if (field in req.body) {
        userData[field] = req.body[field];
      }
    });

    // if (address && typeof address === "object") {
    //   const { country, city, street, zip } = address;

    //   userData.address = { country, city, street, zip };
    // }

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
      `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
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

//google login

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.redirect("/");
    }
    res.redirect("/");
  });
};

//************************ */

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
