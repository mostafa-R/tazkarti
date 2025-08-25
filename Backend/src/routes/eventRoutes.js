import express from "express";
import {
  createEvent,
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  getUpcomingEvents,
  updateEvent,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadEventMedia } from "../middleware/uploads/eventUpload.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware, // ← تأكد إنه مسجل دخول
  roleMiddleware(["organizer", "admin"]),
  uploadEventMedia,
  createEvent
);

router.get("/", getAllEvents);

router.get("/admin", authMiddleware, roleMiddleware(["admin", "organizer"]), getAllEventsAdmin);

router.get("/upcoming", getUpcomingEvents);

router.get("/:id", getEventById);

router.patch(
  "/edit/:id",
  authMiddleware,
  roleMiddleware(["organizer", "admin"]),
  uploadEventMedia,
  updateEvent
);


export default router;