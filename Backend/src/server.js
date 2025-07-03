import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import connectDB from "./config/database.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
const upload = multer({ dest: "uploads/" });

app.use("/auth", authRoutes);

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
