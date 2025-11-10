import express from "express";
import {
  register,
  login,
  getMe,
  refreshToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply strict rate limiting to auth endpoints
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);

export default router;
