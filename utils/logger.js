const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`;
});

const transportList = [
  new transports.Console({
    format: combine(colorize(), timestamp(), devFormat),
  }),
];

// File rotation for production
if (process.env.NODE_ENV === "production") {
  const fileFormat = combine(timestamp(), errors({ stack: true }), json());

  transportList.push(
    new DailyRotateFile({
      filename: "logs/%DATE%-combined.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "8w",
      format: fileFormat,
      level: "info",
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "8w",
      format: fileFormat,
      level: "error",
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: transportList,
  exitOnError: false,
});

// ✅ Morgan-compatible stream (for Express HTTP logs)
const stream = {
  write: (message) => logger.info(message.trim()),
};

// ✅ Redirect console logs to Winston only (no duplicate console output)
console.log = (...args) => logger.info(args.join(" "));
console.error = (...args) => logger.error(args.join(" "));
console.warn = (...args) => logger.warn(args.join(" "));
console.info = (...args) => logger.info(args.join(" "));

module.exports = { logger, stream };
