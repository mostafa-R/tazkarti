import express from "express";
import { createEvent, getAllEvents } from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,             // ← تأكد إنه مسجل دخول
  roleMiddleware(["organizer", "admin"]), // ← وتأكد من صلاحياته
  createEvent
);

router.get("/", getAllEvents);

export default router;
