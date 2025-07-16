//1 - get user
//2- get all users
//3- get user by id
//4- update user
//5- delete user
//6-delete all users

import { Router } from "express";
import { getAllUser, getUser, update } from "../controllers/userController.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const userRoutes = Router();

userRoutes.get("/", getUser);
userRoutes.get("/allusers", roleMiddleware(["admin"]), getAllUser);
userRoutes.patch("/edit", roleMiddleware(["admin", "user"]), update);

export default userRoutes;
