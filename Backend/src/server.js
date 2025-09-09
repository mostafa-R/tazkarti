import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import { createRequire } from "module";
import morgan from "morgan";
import multer from "multer";
import passport from "passport";
import connectDB from "./config/database.js";
import "./config/passport.js";
import { specs } from "./config/swagger.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import {
  compressionMiddleware,
  generalRateLimit,
  healthCheck,
  performanceMonitor,
} from "./middleware/performanceMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sessionService from "./services/sessionService.js";
const require = createRequire(import.meta.url);

const redocExpress = require("redoc-express");
// دول ضفتهم عشان التذاكر والايفنت
import { authMiddleware } from "./middleware/authMiddleware.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import bookingRoutes from "./routes/booking.routes.js";
import chatRoutes from "./routes/chatRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import paymentStatusRoutes from "./routes/paymentStatus.routes.js";
import reportRoutes from "./routes/reportRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import "./utils/archiveOldUsers.js";
import { startCleanupJobs } from "./utils/cleanupExpiredBookings.js";

dotenv.config();
const app = express();

// Configure Express to trust the proxy (important for rate limiting behind proxies)
app.set("trust proxy", 1);

// 📚 Documentation
app.get(
  "/docs",
  redocExpress({
    title: "API Docs",
    specUrl: "/swagger.json",
  })
);

app.get("/api-spec.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});
app.get("/", (req, res) =>
  res.json({
    message: "🎫 Tazkarti API",
    docs: `${req.protocol}://${req.get("host")}/docs`,
  })
);

// Health Check Route
app.get("/health", healthCheck);

// CORS must be first before any other middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "http://localhost:4200",
      "http://127.0.0.1:4200",
      "https://tazkarti.vercel.app",
      "https://tazkarti-ddg5ftu4q-mostafas-projects-e9614a99.vercel.app"
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔎 Incoming request origin:", origin);

      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());

// Performance & Security Middleware
app.use(compressionMiddleware);
app.use(generalRateLimit);
app.use(performanceMonitor);

// لازم express.json ييجي هنا قبل أي routes
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // لو هتستخدم form-data

app.use(helmet());
app.use(morgan("dev"));

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

app.use(
  "/api/booking/checkout/webhook",
  express.raw({ type: "application/json" })
);

// هنا خلي الروتز بعد ما JSON Parser يتفعل
app.use("/api", chatRoutes);

// Public routes
app.use("/auth", authRoutes);
app.use("/api/events", eventRoutes);
// Booking routes (some need to be public like webhook)
app.use("/api/booking", bookingRoutes);

// Protected routes
app.use(authMiddleware);

// Session tracking للمستخدمين المسجلين
app.use((req, res, next) => {
  if (req.user?.id) {
    sessionService.trackUserActivity(req, res, next);
  } else {
    next();
  }
});

app.use("/user", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payment-status", paymentStatusRoutes);

app.use(errorMiddleware);

export const Bootstrap = async () => {
  try {
    await connectDB();

    // تشغيل مهام التنظيف التلقائي
    startCleanupJobs();

    app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log(`✅ Automatic cleanup jobs are running`);
    });
  } catch (error) {
    console.log(("error", (err) => console.log("Server error", err)));
    process.exit(3);
  }
};
