import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  getOrganizerEvents,
  getUpcomingEvents,
  updateEvent,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  cachePublicEvents,
  createEventRateLimit,
} from "../middleware/performanceMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadEventMedia } from "../middleware/uploads/eventUpload.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware, // ← تأكد إنه مسجل دخول
  roleMiddleware(["organizer", "admin"]),
  createEventRateLimit, // Rate limit لإنشاء الأحداث
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

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["organizer", "admin"]),
  uploadEventMedia,
  updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["organizer", "admin"]),
  deleteEvent
);

router.get("/:id", getEventById);

router.patch(
  "/edit/:id",
  authMiddleware,
  roleMiddleware(["organizer", "admin"]),
  uploadEventMedia,
  updateEvent
);

export default router;
