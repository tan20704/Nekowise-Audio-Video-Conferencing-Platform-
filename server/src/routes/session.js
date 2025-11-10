import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getSessions,
  getActiveSessions,
  getSessionById,
  getSessionsByRoom,
  getUserSessions,
  getSessionStats,
} from "../controllers/sessionController.js";

const router = express.Router();

// All session routes require authentication
router.use(protect);

// Get all sessions (paginated)
router.get("/", getSessions);

// Get active sessions
router.get("/active", getActiveSessions);

// Get session statistics
router.get("/stats", getSessionStats);

// Get current user's sessions
router.get("/me", getUserSessions);

// Get sessions by room
router.get("/room/:roomId", getSessionsByRoom);

// Get session by ID
router.get("/:sessionId", getSessionById);

export default router;
