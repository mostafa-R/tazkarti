import { Router } from "express";
import {
  approveEvent,
  deleteUser,
  deleteUserById,
  getAllUsers,
  getNotifictions,
  getUser,
  getUserById,
  profileImage,
  restoreUser,
  restoreUserbyId,
  update,
} from "../controllers/userController.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import profileUpload from "../middleware/uploads/profileUpload.js";

const userRoutes = Router();

userRoutes.get("/allusers", roleMiddleware(["admin"]), getAllUsers);

// userRoutes.get("/organizers", roleMiddleware(["admin"]), getAllOrganizers);

userRoutes.get("/notifications", roleMiddleware(["admin"]), getNotifictions);

userRoutes.post("/approveEvent", roleMiddleware(["admin"]), approveEvent);

// Get current user profile (for /user/profile)
userRoutes.get("/profile", getUser);

// userRoutes.get("/", getUser);

userRoutes.get("/:id", roleMiddleware(["admin", "user"]), getUserById);

// Upload profile image (for /user/upload-profile-image)
userRoutes.post(
  "/upload-profile-image",
  roleMiddleware(["admin", "user", "organizer"]),
  profileUpload.single("profileImage"),
  profileImage
);

userRoutes.patch(
  "/userimage",
  roleMiddleware(["admin", "user", "organizer"]),
  profileUpload.single("profileImage"),

  profileImage
);

// Update user profile (for /user/update)
userRoutes.put(
  "/update",
  roleMiddleware(["admin", "user", "organizer"]),
  update
);

// userRoutes.patch(
//   "/edit",
//   roleMiddleware(["admin", "user", "organizer"]),
//   update
// );

userRoutes.patch("/delete", roleMiddleware(["admin", "user"]), deleteUser);

userRoutes.patch("/restoreuser", roleMiddleware(["user"]), restoreUser);

userRoutes.patch("/delete/:id", roleMiddleware(["admin"]), deleteUserById);

userRoutes.patch(
  "/restoreuser/:id",
  roleMiddleware(["admin"]),
  restoreUserbyId
);

export default userRoutes;
