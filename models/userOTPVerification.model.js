const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
    userId: String,
    otp: String,
    otpVerified: {
        type: Boolean,
        default: false,
    },
    otpType: {
        type: String,
        enum: ['login', 'passwordreset', 'registration'],
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 300000, // 5 minutes from now
    }
});

const UserOTPVerification = mongoose.model("UserOTPVerification", UserOTPVerificationSchema);

module.exports = UserOTPVerification;
