import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({ name, email, password });
    await user.save();

    // إرسال الإيميل
    const link = `${process.env.APP_URL}/verify/${user._id}`;
    await sendEmail(email, "تفعيل حسابك على Tazkarti", link);

    res.status(201).json({
      message: "User registered. Please verify your email.",
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
};

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
