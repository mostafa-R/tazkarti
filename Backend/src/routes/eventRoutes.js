import express from "express";
import { createEvent, getAllEvents, getEventById } from "../controllers/eventController.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/", roleMiddleware(["organizer", "admin"]), createEvent);

router.get("/", getAllEvents);

router.get("/:id", getEventById);

export default router;
