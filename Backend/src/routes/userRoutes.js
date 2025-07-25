import { Router } from "express";
import {
  approveEvent,
  deleteUser,
  deleteUserById,
  getAllOrganizers,
  getAllUser,
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

userRoutes.get("/allusers", roleMiddleware(["admin"]), getAllUser);

userRoutes.get("/organizers", roleMiddleware(["admin"]), getAllOrganizers);

userRoutes.get("/notifications", roleMiddleware(["admin"]), getNotifictions);

userRoutes.post("/approveEvent", roleMiddleware(["admin"]), approveEvent);

userRoutes.get("/", getUser);

userRoutes.get("/:id", roleMiddleware(["admin", "user"]), getUserById);

userRoutes.patch(
  "/userimage",
  roleMiddleware(["admin", "user", "organizer"]),
  profileUpload.single("profileImage"),

  profileImage
);

userRoutes.patch(
  "/edit",
  roleMiddleware(["admin", "user", "organizer"]),
  update
);

userRoutes.patch("/delete", roleMiddleware(["admin", "user"]), deleteUser);

userRoutes.patch("/restoreuser", roleMiddleware(["user"]), restoreUser);

userRoutes.patch("/delete/:id", roleMiddleware(["admin"]), deleteUserById);

userRoutes.patch(
  "/restoreuser/:id",
  roleMiddleware(["admin"]),
  restoreUserbyId
);

export default userRoutes;
