import express from "express";
import {
  bookingTicket
 
} from "../controllers/booking.controller.js";
// import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/", bookingTicket);
export default router;
