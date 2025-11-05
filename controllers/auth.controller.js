const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const { mongoLoginHandler } = require("../services/user.services");
const Blacklist = require('../models/blacklist.model');
const RefreshToken = require('../models/refresh.model');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const userOTPVerification = require('../models/userOTPVerification.model');
const { transporter } = require("../utils/sendMail");
const { getUserIdFromSession } = require("../helpers/GetUserInfoFromSessionID");
const { loginValidationSchema } = require('../validators/loginValidator.js');
const { registerValidationSchema } = require('../validators/registerValidator.js');
const { logger } = require("../utils/logger");


const loginHandler = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1️⃣ Validate input
        const { error } = loginValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({success: false,message: req.t(error.details[0].message),data: ""});
        }

        // 2️⃣ Attempt login
        const result = await mongoLoginHandler({ email, password });
        if (!result.success) {
            // If a user exists with this email, and the password is wrong, increment PasswordAttempts
            try {
                const attemptedUser = await userModel.findOne({ email });
                if (attemptedUser) {
                    const isMatch = await attemptedUser.comparePasswords(password);
                    if (!isMatch) {
                        attemptedUser.PasswordAttempts = (attemptedUser.PasswordAttempts || 0) + 1;
                        await attemptedUser.save();
                        logger.warn(`🔐 Wrong password for ${email}. Attempts=${attemptedUser.PasswordAttempts}`);

                        // If attempts reached threshold, block account
                        if (attemptedUser.PasswordAttempts > 3) {
                            attemptedUser.isActive = false;
                            await attemptedUser.save();
                            logger.warn(`🔒 Account blocked for ${email} after ${attemptedUser.PasswordAttempts} failed attempts`);
                            return res.status(403).json({ success: false, message: req.t("auth.account_blocked"), data: "" });
                        }
                    }
                }
            } catch (err) {
                logger.error(`Error incrementing PasswordAttempts for ${email}: ${err.message}`);
            }

            return res.status(401).json({success: false,message: req.t("auth.login_failed"),data: "",});
        }

        const user = result.user;
        // reset PasswordAttempts on successful login
        if (user && user.PasswordAttempts && user.PasswordAttempts > 0) {
            try {
                await userModel.findByIdAndUpdate(user._id, { PasswordAttempts: 0 });
            } catch (err) {
                logger.error(`Error resetting PasswordAttempts for ${email}: ${err.message}`);
            }
        }
        // 2.a️⃣ Blocked account check
        if (user && user.isActive === false) {
            logger.warn(`🔒 Blocked account login attempt for ${email}`);
            return res.status(403).json({ success: false, message: req.t("auth.account_blocked2"), data: "" });
        }

        // 3️⃣ Detect client IP
        const rawIp =(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() ||req.socket?.remoteAddress ||req.connection?.remoteAddress ||"";

        const clientIp = rawIp.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

        // 4️⃣ Log attempt
        logger.info(`🟢 Login attempt for ${email} from IP: ${clientIp}`);
        const isNewIp = !user.lastLoginIp || user.lastLoginIp !== clientIp;

        // 5️⃣ Update IP + lastLoginAt
        await userModel.findByIdAndUpdate(
        user._id,
        {
            $set: {
                lastLoginIp: clientIp,
                lastLoginAt: new Date(),
            },
        },
        { new: true }
        );

        // 6️⃣ Apply your logic
        let shouldSendOTP = false;

        if (!isNewIp && user.loginVerified === false) {
            // Case 1: same IP + loginVerified false
            shouldSendOTP = true;
        } else if (isNewIp && user.loginVerified === false) {
            // Case 2: new IP + loginVerified false
            shouldSendOTP = true;
        } else if (isNewIp && user.loginVerified === true) {
            // Case 3: new IP + loginVerified true → reset to false & send OTP
            await userModel.findByIdAndUpdate(user._id, { loginVerified: false });
            shouldSendOTP = true;
        }

        if (shouldSendOTP) {
            // Generate OTP
            const otp = Math.floor(1000 + Math.random() * 9000);
            const hashedOTP = crypto
                .createHash("sha256")
                .update(otp.toString())
                .digest("hex");
            const token = crypto.randomBytes(32).toString("hex");

            await new userOTPVerification({
                userId: user._id,
                otp: hashedOTP,
                otpType: "login",
                otpVerified: false,
                token,
            }).save();

            // Send OTP email
            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: user.email,
                subject: "Your Login OTP Code",
                html: `<p>Your OTP code for login is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
            };
            await transporter.sendMail(mailOptions);

            logger.info(`📧 OTP sent to ${email} (IP: ${clientIp})`);

            return res.status(200).json({
                success: true,
                message: req.t("otp.otp_sent_to_email"),
                data: {
                    userInfo: {
                        sessionId: result.data.token,
                        refreshToken: result.data.refreshToken,
                        userId: user.id,
                        role: user.role,
                        name: user.fullName,
                        email: user.email,
                        isActive: user.isActive,
                        loginVerified: false,
                        lastLoginIp: clientIp,
                    },
                    otpToken: token,
                },
            });
        }

        // Case 4: same IP + loginVerified true → normal login
        logger.info(`✅ Login success for ${email} from trusted IP: ${clientIp}`);

        return res.status(200).json({
            success: true,
            message: req.t("auth.login_success"),
            data: {
                    sessionId: result.data.token,
                    refreshToken: result.data.refreshToken,
                    userId: user.id,
                    role: user.role,
                    name: user.fullName,
                    email: user.email,
                    isActive: user.isActive,
                    loginVerified: user.loginVerified,
                    lastLoginIp: clientIp,
                },
            });
        } catch (error) {
            logger.error(`❌ Login error: ${error.message}`);
            return res.status(500).json({
            success: false,
            message: req.t("common.Internal_error"),
            data: "",
        });
    }
};

// ✅ Register handler
const registerHandler = async (req, res) => {
    const { first_name, second_name, last_name, nationality, phone_number, email, password, role, DateofBirth, university_name } = req.body;
    try {

        const { error } = registerValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
        }

        const user = await userModel.create({
            first_name,
            second_name,
            last_name,
            nationality,
            phone_number,
            email,
            password,
            role,
            DateofBirth,
            university_name,
            isActive: typeof isActive === 'boolean' ? isActive : true,
        });
        return res.status(201).json({ success: true, message: req.t("common.created_successfully"), data: user });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: req.t("auth.user_exists"),
                data: ''
            });
        }
        console.log("error while registering user", error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

// ✅ change password
const changePasswordHandler = async (req, res) => {
    try {
        const sessionid = req.headers.sessionid;
        if (!sessionid) {
            return res.status(400).json({ success: false, message: req.t("auth.seesion_id_required"), data: '' });
        }

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: req.t("auth.old_new_password_required"), data: '' });
        }

        const userId = await getUserIdFromSession(sessionid);
        if (!userId) {
            return res.status(401).json({ success: false, message: req.t("auth.invalid_expired_session"), data: '' });
        }

        // Get user from DB
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: req.t("auth.user_not_found"), data: '' });
        }

        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: req.t("auth.invalid_credentials"), data: '' });
        }

        // Update password in DB
        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: req.t("auth.password_changed"), data: '' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

// forget password
const forgetPasswordHandler = async (req, res) => {

    // get email from req body
    const { email } = req.body;

    // check if there is a user with this email
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ success: false, message: req.t("auth.user_not_found"), data: '' });
    }

    // generate an OTP
    const otp = Math.floor(1000 + Math.random() * 9000)


    //hash otp
    const hashedOTP = await crypto.createHash("sha256").update(otp.toString()).digest("hex");

    // generate token
    const token = crypto.randomBytes(32).toString("hex");

    // save otp to database
    const newOTPVerication = await new userOTPVerification({
        userId: user._id,
        otp: hashedOTP,
        otpType: 'passwordreset',
        token: token,
        otpVerified: false,
    }).save();

    // make user unverified until he resets his password
    user.Verified = false;
    await user.save();

    // send the OTP to the user's email
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: user.email,
        subject: "Your Password Reset OTP Code",
        html: `<p>Your OTP code for password reset is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: req.t("otp.otp_sent_to_email"), data: { token: token } });

}

// hander for check that user enter OTP correctly
const checkOTP = async (req, res) => {

    const { otp, token } = req.body;

    if (!otp || !token) {
        return res.status(400).json({ success: false, message: req.t("otp.otp_and_token_required"), data: '' });
    }

    const hashedOTP = await crypto.createHash("sha256").update(otp.toString()).digest("hex");

    // find the OTP and token in the database
    const otpRecord = await userOTPVerification.findOne({ otp: hashedOTP, token: token });


    if (!otpRecord) {
        return res.status(400).json({ success: false, message: req.t("otp.Invalid_otp"), data: '' });
    }

    // check if the OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
        return res.status(400).json({ success: false, message: req.t("otp.otp_expired"), data: '' });
    }

    // mark the OTP as verified
    console.log("-------------------------------------");
    otpRecord.otpVerified = true;

    // get the user
    const user = await userModel.findById(otpRecord.userId);

    // if OTP type is login make user loginVerified true
    if (otpRecord.otpType === 'login') {
        user.loginVerified = true;
    }

    // if OTP type is registration make user Verified true
    if (otpRecord.otpType === 'registration') {
        user.Verified = true;
        console.log(user);
    }

    await otpRecord.save();

    await user.save();

    return res.status(200).json({ success: true, message: req.t("otp.opt_verfied"), data: '' });

}

// reset password handler
const resetPasswordHandler = async (req, res) => {
    const { email, newPassword } = req.body;

    // get user by email
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ success: false, message: req.t("auth.user_not_found"), data: '' });
    }

    // check if OTP is already verified
    const otpRecord = await userOTPVerification.findOne({ userId: user._id, otpVerified: true, otpType: 'passwordreset' });

    if (!otpRecord) {
        return res.status(400).json({ success: false, message: req.t("otp.no_verified_otp_found"), data: '' });
    }

    if (!otpRecord.otpVerified) {
        return res.status(400).json({ success: false, message: req.t("otp.opt_not_verified"), data: '' });
    }

    // make otp unverified again
    otpRecord.otpVerified = false;
    otpRecord.expiresAt = undefined;
    await otpRecord.save();

    // update the user's password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: req.t("auth.password_reset_success"), data: '' });

}

// ✅ Logout handler
const logoutHandler = async (req, res) => {
    const sessionid = req.headers.sessionid;
    const { refreshToken } = req.body;
    if (!sessionid) {
        return res.status(400).json({ success: false, message: req.t("auth.seesion_id_required"), data: '' });
    }

    try {
        await Blacklist.findOneAndUpdate(
            { token: sessionid },
            { $setOnInsert: { token: sessionid, blacklistedAt: new Date() } },
            { upsert: true, new: true }
        );

        if (refreshToken) {
            await RefreshToken.findOneAndDelete({ token: refreshToken });
        }


        console.log("Token blacklisted✅");
        return res.status(200).json({ success: true, message: req.t("auth.Logout_success"), data: '' });
    } catch (err) {
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

// ✅ Refresh handler
const refreshHandler = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: req.t("auth.refresh_token_required"), data: '' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const stored = await RefreshToken.findOne({ token: refreshToken });
        if (!stored) return res.status(401).json({ success: false, message: req.t("auth.invalid_refresh_token"), data: '' });

        const user = await userModel.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: req.t("auth.user_not_found"), data: '' });

        // ⚙️ احذف القديم وأنشئ جديد
        await RefreshToken.findOneAndDelete({ token: refreshToken });
        const newAccessToken = user.createJWT();
        const newRefreshToken = user.createRefreshToken();
        await RefreshToken.create({ token: newRefreshToken, user: user._id });

        return res.status(200).json({
            success: true,
            message: req.t("auth.token_refreshed"),
            data: { token: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (err) {
        console.error('refresh error', err);
        return res.status(401).json({ success: false, message: req.t("auth.invalid_refresh_token"), data: '' });
    }
};



module.exports = {
    loginHandler,
    registerHandler,
    changePasswordHandler,
    forgetPasswordHandler,
    checkOTP,
    resetPasswordHandler,
    logoutHandler,
    refreshHandler,
};
