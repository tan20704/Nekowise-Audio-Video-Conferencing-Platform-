/**
 * Client-side logger utility
 * Provides contextual logging with different log levels
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL =
  import.meta.env.MODE === "development" ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

class Logger {
  constructor(context = "App") {
    this.context = context;
  }

  _log(level, levelName, message, ...args) {
    if (level < CURRENT_LOG_LEVEL) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${levelName}] [${this.context}]`;

    switch (levelName) {
      case "ERROR":
        console.error(prefix, message, ...args);
        break;
      case "WARN":
        console.warn(prefix, message, ...args);
        break;
      case "INFO":
        console.info(prefix, message, ...args);
        break;
      case "DEBUG":
      default:
        console.log(prefix, message, ...args);
        break;
    }
  }

  debug(message, ...args) {
    this._log(LOG_LEVELS.DEBUG, "DEBUG", message, ...args);
  }

  info(message, ...args) {
    this._log(LOG_LEVELS.INFO, "INFO", message, ...args);
  }

  warn(message, ...args) {
    this._log(LOG_LEVELS.WARN, "WARN", message, ...args);
  }

  error(message, ...args) {
    this._log(LOG_LEVELS.ERROR, "ERROR", message, ...args);
  }
}

// Default logger instance
const logger = new Logger();

export { Logger, logger };
export default logger;
