// src/routes/chatRoutes.js
import express from "express";
import { chatBot } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", chatBot);

export default router;
