
const JWT = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");
const userModel = require("../models/user.model");

const requireMongoUser = async (req, res, next) => {
  const token = req.headers.sessionid;

  if (!token) {
    return res.status(401).json({success: false , message:"No token provided" , data:'' });
  }

  const isBlacklisted = await Blacklist.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ success: false , message: "Token is blacklisted. Please login again." , data: '' });
  }

  try {
    const payload = JWT.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is verified
    const user = await userModel.findById(payload.userId || payload.id);
    if (!user) {
      return res.status(401).json({ success: false , message: "User not found" , data: '' });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false , message: "invalid token" , data: '' });
  }
};

module.exports = { requireMongoUser };
