import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/database.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/", authRoutes);

app.use(errorMiddleware);

export const Bootstrap = () => {
  connectDB();
  app
    .listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })
    .on("error", (err) => console.log("Server error", err));
};
