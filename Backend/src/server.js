import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import passport from "passport";
import connectDB from "./config/database.js";
import "./config/passport.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// دول ضفتهم عشان التذاكر والايفنت
import { authMiddleware } from "./middleware/authMiddleware.js";
import bookingRoutes from "./routes/booking.routes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import "./utils/archiveOldUsers.js";

dotenv.config();
const app = express();
// Add a root route for GET /
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use(cookieParser());
// Update: Explicitly set allowed origin for frontend and credentials for cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Updated to match your frontend port
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// init session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// passport init
app.use(passport.initialize());
app.use(passport.session());

// Public routes (مش محتاجة authentication)
app.use("/auth", authRoutes);

// Public API routes (accessible without authentication)
app.use("/api/events", eventRoutes);

// Protected routes (محتاجة authentication)
app.use(authMiddleware);
app.use("/user", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/booking", bookingRoutes);

// pay methode  url
// app.post("/api/pay", createPayment);
app.use(errorMiddleware);

export const Bootstrap = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(("error", (err) => console.log("Server error", err)));
    process.exit(3);
  }
};
