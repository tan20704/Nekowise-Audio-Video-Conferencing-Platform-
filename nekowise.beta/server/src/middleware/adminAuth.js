import logger from "../utils/logger.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
      logger.warn("Admin access denied", {
        userId: req.user.id,
        role: req.user.role,
      });
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    logger.error("Admin middleware error", { error: error.message });
    res.status(500).json({ message: "Authorization error" });
  }
};
