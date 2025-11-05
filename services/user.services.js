const userModel = require("../models/user.model");
const RefreshToken = require("../models/refresh.model");
const bcrypt = require("bcryptjs");
const omit = require("lodash/omit");

const mongoLoginHandler = async ({ email, password }) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (!(await user.comparePasswords(password))) {
    return { success: false, message: "Invalid password" };
  }

  const token = user.createJWT();

  // create and persist refresh token
  const refreshToken = user.createRefreshToken();
  try {
    await RefreshToken.create({ token: refreshToken, user: user._id });
  } catch (err) {
    // if refresh token creation fails, log but continue returning access token
    console.error('Failed to persist refresh token', err);
  }

  return {
    success: true,
    message: "Logged in successfully",
    data: { token, refreshToken },
    user: omit(user.toObject(), ["password"]),
    mongoUser: user
  };
};

module.exports = {
  mongoLoginHandler,
};
