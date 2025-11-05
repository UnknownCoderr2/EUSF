const path = require("path");
const multer = require("multer");
const fs = require("fs");

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {

        // image upload path: /documents/:university_name/:student_id/

        const university_name = req.body.university_name;

        const student_id = req.body.student_id;

        // Create the directory if it doesn't exist
        const dir = path.join(__dirname, "..", "documents", `${university_name}`, `${student_id}`);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        if (file) {
            const university_name = req.body.university_name;
            const student_id = req.body.student_id;
            const ext = path.extname(file.originalname); // extension like .jpg or .png

            // file.fieldname should be like: 'nationalId_image', 'universityId_image', 'personal_image', 'medical_image'
            let fileName = "";

            switch (file.fieldname) {
                case "nationalId_image":
                    fileName = `nationalId_image_${student_id}${ext}`;
                    break;
                case "universityId_image":
                    fileName = `universityId_image_${student_id}${ext}`;
                    break;
                case "personal_image":
                    fileName = `personal_image_${student_id}${ext}`;
                    break;
                case "medical_image":
                    fileName = `medical_image_${student_id}${ext}`;
                    break;
                case "passport_image":
                    fileName = `passport_image_${student_id}${ext}`;
                    break;
                case "registeration_form_image":
                    fileName = `registeration_form_image_${student_id}${ext}`;
                    break;
                default:
                    fileName = `unknown__${student_id}${ext}`;
            }

            // Full path to check if file already exists
            const uploadDir = path.join(__dirname, "..", "documents", university_name, student_id);
            const filePath = path.join(uploadDir, fileName);

            // If file already exists → delete it before saving the new one
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            cb(null, fileName);
        } else {
            cb(new Error("No file provided"), false);
        }
    }
})

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },

    // limits: { fileSize: 2 * 1024 * 1024 } // 2 MB file size limit

});

module.exports = {
    uploadImage
};