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
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const app = express();

// Add a root route for GET /
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use(cookieParser());

// لازم express.json ييجي هنا قبل أي routes
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // لو هتستخدم form-data

// Update: Explicitly set allowed origin for frontend and credentials for cookies
app.use(
  cors({
    origin:["http://localhost:4200", "http://localhost:5173"], // Updated to match your frontend port
    credentials: true,
  })
);

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

// هنا خلي الروتز بعد ما JSON Parser يتفعل
app.use("/api", chatRoutes);

// Public routes
app.use("/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Protected routes
app.use(authMiddleware);
app.use("/user", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/booking", bookingRoutes);

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
