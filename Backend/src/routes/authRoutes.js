import express from "express";
import {
  register,
  registerOrganizer,
  verifyEmail,
} from "../controllers/authController.js";
import { validate } from "../middleware/authMiddleware.js";
import {
  getOrganizerValidationSchema,
  getUserValidationSchema,
} from "../validators/dynvalidation.js";

const router = express.Router();

router.post(
  "/register",
  validate(getUserValidationSchema({ isUpdate: false })),
  register
);
router.post(
  "/registerOrganizer",
  validate(getOrganizerValidationSchema({ isUpdate: false })),
  registerOrganizer
);

router.post("/verifyOTP", verifyEmail);

// router.post("/login", login);

export default router;
