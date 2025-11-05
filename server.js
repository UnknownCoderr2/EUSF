const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
require("dotenv").config();
const path = require("path");
const { i18nextMiddleware } = require("./config/i18n");


const { dbConnect } = require("./lib/db/dbConnect");
const { authRouter } = require("./routes/auth.route");
const { usersRouter } = require("./routes/users.route");
const { studentsRouter } = require("./routes/students.route");
const { universityRouter } = require("./routes/university.route");
const { sportsRouter } = require("./routes/sport.route");
const {defaultRouter} = require("./routes/default.route");
const{ statisticsRouter} = require("./routes/statistics.route");
const { requestLogger } = require('./middleware/requestLogger');

// ✅ middlewares
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(i18nextMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use("/documents", express.static(path.join(process.cwd(), "documents")));


// ✅ fix for express-mongo-sanitize issue
app.use((req, res, next) => {
  if (req.body) req.body = sanitize.sanitize(req.body);
  if (req.params) req.params = sanitize.sanitize(req.params);
  next();
});

app.set("trust proxy", true); // to get the correct client IP when behind a proxy (e.g., Heroku, Nginx)
app.use(requestLogger)
app.disable("x-powered-by");

// ✅ routes
app.use("/v1/api/auth/", authRouter);
app.use("/v1/api/users/", usersRouter);
app.use("/v1/api/students/", studentsRouter);
app.use("/v1/api/universities/", universityRouter);
app.use("/v1/api/sports/", sportsRouter);
app.use("/v1/api/default/", defaultRouter);
app.use("/v1/api/statistics/", statisticsRouter);


// ✅ database connection
dbConnect();

console.log("🌐 Environment:", process.env.NODE_ENV);

// ✅ start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
