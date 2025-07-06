import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, roleMiddleware(["admin"]), createTicket)  //الادمن بس 
  .get(protect, getTickets); //اى حد سواء الادمن او اليوزر

router
  .route("/:id")
  .get(protect, getTicketById)
  .put(protect, roleMiddleware(["admin"]), updateTicket) //الادمن بس 
  .delete(protect, roleMiddleware(["admin"]), deleteTicket); // الادمن بس 

export default router;
