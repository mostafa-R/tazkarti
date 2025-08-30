import express from "express";
import {
  createEvent,
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  getOrganizerEvents,
  getUpcomingEvents,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  cachePublicEvents,
} from "../middleware/performanceMiddleware.js";
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

router.get("/", cachePublicEvents, getAllEvents); // مع cache للأحداث العامة

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin", "organizer"]),
  getAllEventsAdmin
);

router.get("/upcoming", cachePublicEvents, getUpcomingEvents); // مع cache

// Organizer-specific routes
router.get(
  "/organizer/my-events",
  authMiddleware,
  roleMiddleware(["organizer"]),
  getOrganizerEvents
);

router.get("/:id", getEventById);

export default router;
