const { logger } = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // When the response finishes, log info or error
  res.on("finish", () => {
    const duration = Date.now() - start;
    const user = req.user?.username || req.user?.email || "Anonymous";
    const status = res.statusCode;

    const logMessage = `${req.method} ${req.originalUrl} ${status} | 👤 user: ${user} | ⏱ ${duration}ms`;

    if (status >= 400) {
      // Log as error if it's client or server error
      logger.error(logMessage);
    } else {
      // Normal info log
      logger.info(logMessage);
    }
  });

  next();
};

module.exports = {requestLogger};
