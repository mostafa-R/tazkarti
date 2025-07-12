import express from "express";
import passport from "passport";
import {
  logout,
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

///google login
//http://localhost:5000/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", logout);

// router.post("/login", login);

export default router;
