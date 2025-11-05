const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    second_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "super admin", "university representative", "referee", "voulanteer"],
    },
    university_name: {
      required: true,
      type: String,
      trim: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    loginVerified: {
      type: Boolean,
      default: false,
    },
    DateofBirth: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginIp: { type: String },
    lastLoginAt: { type: Date },
    PasswordAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePasswords = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.createJWT = function () {
  const token = JWT.sign(
    {
      id: this._id,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    },
  );
  return token;
};

userSchema.methods.createRefreshToken = function () {
  // Use a separate secret and lifetime for refresh tokens
  const token = JWT.sign(
    {
      id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
    },
  );
  return token;
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
