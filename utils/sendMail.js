const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter error:", error);
    } else {
        console.log("Email transporter is ready to send messages");
    }
});

const sendEmail = async ({ id, email, subject, body, status, message }, res) => {
    try {
        console.log(id)
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject,
            html: body,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: status, message: message, data: { email, id } });

    } catch (error) {
        res.status(400).json({ success: "FAILED", message: error.message, data: '' });
    }
}

module.exports = { sendEmail, transporter };