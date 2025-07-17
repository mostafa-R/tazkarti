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
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./utils/archiveOldUsers.js";

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors());
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

app.use("/auth", authRoutes);
app.use(authMiddleware);
app.use("/user", userRoutes);

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
