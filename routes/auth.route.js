const express = require("express");
const authRouter = express.Router();
const {
  loginHandler,
  registerHandler,
  changePasswordHandler,
  forgetPasswordHandler,
  checkOTP,
  resetPasswordHandler,
  logoutHandler,
  refreshHandler
} = require("../controllers/auth.controller");

const { requireMongoUser } = require("../middleware/requireMongoUser");


authRouter.route("/login").post(loginHandler);
authRouter.route("/create-user").post(registerHandler);
authRouter.route("/change-password").post(changePasswordHandler);
authRouter.route("/forget-password").post(forgetPasswordHandler);
authRouter.route("/check-otp").post(checkOTP);
authRouter.route("/reset-password").post(resetPasswordHandler);
authRouter.route("/logout").post(requireMongoUser, logoutHandler);
authRouter.route("/refresh").post(refreshHandler);

module.exports = {
  authRouter,
};
