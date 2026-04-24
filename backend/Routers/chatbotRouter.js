import express from "express";
import { chatbotQueryController } from "../controllers/chatbotController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/query").post(authMiddleware, chatbotQueryController);

export default router;
