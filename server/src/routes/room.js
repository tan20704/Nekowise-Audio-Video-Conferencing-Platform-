import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  validateRoomAccess,
  deleteRoom,
  getCompletedRooms,
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";
import { createRoomLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to room creation
router.post("/", protect, createRoomLimiter, createRoom);
router.get("/", protect, getRooms);
router.get("/completed", protect, getCompletedRooms);
router.get("/:roomId", protect, getRoomById);
router.post("/:roomId/validate", protect, validateRoomAccess);
router.delete("/:roomId", protect, deleteRoom);

export default router;
