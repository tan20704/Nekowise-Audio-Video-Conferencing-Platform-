import express from "express";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import {
  getSystemStats,
  getActiveRooms,
  getRecentSessions,
  getAllUsers,
  closeRoom,
  updateUserRole,
  deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// System statistics
router.get("/stats", getSystemStats);

// Active rooms
router.get("/rooms/active", getActiveRooms);

// Recent sessions
router.get("/sessions/recent", getRecentSessions);

// User management
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Room management
router.post("/rooms/:roomId/close", closeRoom);

export default router;
