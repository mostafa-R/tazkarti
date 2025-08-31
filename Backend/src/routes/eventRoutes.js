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

// ✅ ALLOWED: Organizers can CREATE events
router.post(
  "/create",
  authMiddleware, // ← تأكد إنه مسجل دخول
  roleMiddleware(["organizer", "admin"]),
  createEventRateLimit, // Rate limit لإنشاء الأحداث
  uploadEventMedia,
  createEvent
);

// Public routes (unchanged - for users)
router.get("/", cachePublicEvents, getAllEvents); // مع cache للأحداث العامة

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin", "organizer"]),
  getAllEventsAdmin
);

router.get("/upcoming", cachePublicEvents, getUpcomingEvents); // مع cache

// ✅ ALLOWED: Organizers can VIEW their own events
router.get(
  "/organizer/my-events",
  authMiddleware,
  roleMiddleware(["organizer"]),
  getOrganizerEvents
);

// ❌ RESTRICTED: UPDATE routes - ADMIN ONLY now (organizers blocked)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]), // ❌ Removed "organizer" - ADMIN ONLY
  uploadEventMedia,
  updateEvent
);

// ❌ RESTRICTED: DELETE routes - ADMIN ONLY now (organizers blocked)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]), // ❌ Removed "organizer" - ADMIN ONLY
  deleteEvent
);

// ✅ ALLOWED: Anyone can VIEW specific event details (public route)
router.get("/:id", getEventById);

// ❌ RESTRICTED: PATCH/EDIT route - ADMIN ONLY now (organizers blocked)
router.patch(
  "/edit/:id",
  authMiddleware,
  roleMiddleware(["admin"]), // ❌ Removed "organizer" - ADMIN ONLY
  uploadEventMedia,
  updateEvent
);

export default router;