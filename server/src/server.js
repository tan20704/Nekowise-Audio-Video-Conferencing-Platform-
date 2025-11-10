import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import connectDatabase from "./config/database.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import roomRouter from "./routes/room.js";
import sessionRouter from "./routes/session.js";
import adminRouter from "./routes/admin.js";
import logger from "./utils/logger.js";
import validateEnv from "./utils/validateEnv.js";
import SignalingServer from "./websocket/server.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Validate CLIENT_URL
const clientUrl = process.env.CLIENT_URL;
if (!clientUrl) {
  logger.warn(
    "CLIENT_URL not set in environment variables. CORS will reject all requests."
  );
}

app.use(helmet());
app.use(
  cors({
    origin: clientUrl || "http://localhost:5173", // Default fallback for development
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/admin", adminRouter);

if (process.env.NODE_ENV === "development") {
  app.get("/api/debug/info", (req, res) => {
    res.json({
      message: "Server debug information",
      availableRoutes: [
        "GET /api/health",
        "POST /api/auth/register",
        "POST /api/auth/login",
        "GET /api/auth/me",
        "POST /api/rooms",
        "GET /api/rooms",
        "GET /api/sessions",
        "GET /api/admin/stats",
        "WS /ws",
      ],
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      port: PORT,
    });
  });
}

app.use((req, res) => {
  logger.warn("Route not found", { path: req.path, method: req.method });
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

connectDatabase();

const signalingServer = new SignalingServer(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server running on ws://localhost:${PORT}/ws`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);

  // Close WebSocket connections gracefully
  signalingServer.wss.clients.forEach((ws) => {
    ws.close(1000, "Server shutting down");
  });

  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
