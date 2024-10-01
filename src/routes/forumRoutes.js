import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { registerUser, loginUser } from "../controllers/authController.js";
import {
  createThread,
  getAllThreads,
  getThreadWithResponses,
  postResponseToThread, // Import this function from your forumController
} from "../controllers/forumController.js"; // Ensure this function is defined in your controller

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Create a new thread
router.post("/threads", authenticateJWT, createThread);

// Get all threads
router.get("/threads", getAllThreads);

// Get a specific thread with responses
router.get("/threads/:threadId", getThreadWithResponses);

// Post a response to a specific thread
router.post(
  "/threads/:threadId/responses",
  authenticateJWT,
  postResponseToThread
);

export default router;
