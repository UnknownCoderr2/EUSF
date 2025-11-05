const fs = require('fs');
const path = require('path');
const QRCode = require ("qrcode");
const studentModel = require("../models/students.model");
const { exportToExcel } = require("../utils/excelExport");
const { updateStudentValidationSchema, registerStudentValidationSchema } = require('../validators/studentValidator.js');
const { getImageUrl } = require('../utils/getImageURl.js');
const { encrypt, decrypt } = require('../utils/urlCipher');

const addStudentHandler = async (req, res) => {
    try {

        const { error } = registerStudentValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
        }

        const { student_id, first_name, second_name, last_name, national_id, birth_date, gender, university_name, faculty, year_level, student_phone, student_email,emergency_contact,hotel_address,nationltiy,Paralympic} = req.body;

        // Check if student is at least 18 years old
        const birthDate = new Date(birth_date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return res.status(400).json({
                success: false,
                message: req.t("student.minimum_age_required"),
                data: ''
            });
        }

        if( nationltiy != "Egypt" ) {
            if (!req.files || !req.files['nationalId_image'] || !req.files['universityId_image'] || !req.files['personal_image'] || !req.files['medical_image']
                 || !req.files['passport_image'] || !req.files['registeration_form_image']) {
                return res.status(400).json({ success: false, message: "nationalId_image, universityId_image, personal_image and medical_image are require", data: '' });
            }
            if(!hotel_address){
                return res.status(400).json({ success: false, message: req.t("student.hotel_address_required"), data: '' });
            }
        }else{
            if (!req.files['nationalId_image'] || !req.files['universityId_image'] || !req.files['personal_image'] || !req.files['medical_image']|| !req.files['registeration_form_image']) {
                return res.status(400).json({ success: false, message: "nationalId_image, universityId_image, personal_image and medical_image are require", data: '' });
            }
        }

        // Check for existing student with same national_id
        const existingNationalId = await studentModel.findOne({ national_id });
        if (existingNationalId) {
            return res.status(400).json({ success: false, message: req.t("student.national_id_exists"), data: '' });
        }

        const existingStudent = await studentModel.findOne({ student_id });
        if (existingStudent) {
            return res.status(400).json({ success: false, message:  req.t("student.student_profile_exists"), data: '' });
        }

        const existingStudentEmail = await studentModel.findOne({ student_email });
        if (existingStudentEmail) {
            return res.status(400).json({ success: false, message:  req.t("student.student_profile_email_exists"), data: '' });
        }
        // get image paths from req.files
        const documents = [
            req.files['nationalId_image'] ? getImageUrl(req, req.files['nationalId_image'][0].path) : null,
            req.files['universityId_image'] ? getImageUrl(req, req.files['universityId_image'][0].path) : null,
            req.files['personal_image'] ? getImageUrl(req, req.files['personal_image'][0].path) : null,
            req.files['medical_image'] ? getImageUrl(req, req.files['medical_image'][0].path) : null,
            req.files['passport_image'] ? getImageUrl(req, req.files['passport_image'][0].path) : null,
            req.files['registeration_form_image'] ? getImageUrl(req, req.files['registeration_form_image'][0].path) : null,
        ];

        const studentData = {
            student_id,
            first_name,
            second_name,
            last_name,
            national_id,
            birth_date,
            gender,
            university_name,
            faculty,
            year_level,
            student_phone,
            student_email,
            documents,
            emergency_contact,
            hotel_address,
            nationltiy,
            Paralympic
        };

        const newStudent = await studentModel.create(studentData);

        return res.status(201).json({ success: true, message:  req.t("common.created_successfully"), data: newStudent });
    } catch (error) {
        console.error("addStudent error", error);
        return res.status(500).json({ success: false, message:  req.t("common.Internal_error"), data: '' });
    }
};

const getStudentsHandler = async (req, res) => {
    try {
        // Support both GET (query) and POST (body) callers. Use an empty object as a safe default
        const source = (req.method === 'GET' ? req.query : req.body) || {};
        const {
            excel,
            university_name,
            page: pageQuery,
            limit: limitQuery,
            gender,
            nationality,
            participation,
            status,
            isActive
        } = source;

        const filter = {};

        if (university_name) {
            filter.university_name = { $regex: new RegExp(university_name, 'i') };
        }
        if (gender) {
            filter.gender = gender;
        }
        if (nationality) {
            filter.nationltiy = { $regex: new RegExp(nationality, 'i') };
        }
        if (status) {
            filter.status = status;
        }
        if (isActive) {
            filter.isActive = isActive
        }
        if (participation) {
            const participationValues = participation.split(',').map(p => p.trim());
            filter.participation = { $in: participationValues };
        }

        const projection = { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 };

        if (excel === 'true') {
            const studentsForExcel = await studentModel.find(filter, projection);
            const excelData = studentsForExcel.map(student => ({
                'Student ID': student.student_id,
                'First Name': student.first_name,
                'Second Name': student.second_name,
                'Last Name': student.last_name,
                'National ID': student.national_id,
                'Birth Date': student.birth_date ? new Date(student.birth_date).toLocaleDateString('en-GB') : '',
                'Gender': student.gender,
                'University': student.university_name,
                'Faculty': student.faculty,
                'Year Level': student.year_level,
                'Phone': student.student_phone,
                'Email': student.student_email,
                'Status': student.status,
                'Active': student.isActive ? 'Yes ✔️' : 'No ❌',
                'Participations': Array.isArray(student.participation) ? student.participation.join(', ') : ''
            }));
            // Customize column widths
            const colWidths = [
                { wch: 15 }, // Student ID
                { wch: 15 }, // First Name
                { wch: 15 }, // Second Name
                { wch: 15 }, // Last Name
                { wch: 20 }, // National ID
                { wch: 12 }, // Birth Date
                { wch: 8 },  // Gender
                { wch: 25 }, // University
                { wch: 20 }, // Faculty
                { wch: 10 }, // Year Level
                { wch: 15 }, // Phone
                { wch: 25 }, // Email
                { wch: 10 }, // Status
                { wch: 10 },  // Active
                { wch: 30 }, // Participations
            ];
            exportToExcel(excelData, 'students', colWidths, res);
            return;
        }

        const MAX_LIMIT = 100;
        const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(limitQuery, 10) || 10, 1), MAX_LIMIT);

        const total = await studentModel.countDocuments(filter);
        const totalPages = Math.max(Math.ceil(total / limit), 1);


        const skip = (page - 1) * limit;
        const students = await studentModel.find(filter, projection).skip(skip).limit(limit);

        return res.status(200).json({
            success: true,
            message:  req.t("common.fetched_successfully"),
            data: students,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {

        console.error("getStudents error", error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const getStudentByIdHandler = async (req, res) => {
    try {

        const  id  = req.body.id;
        console.log("Fetching student with ID:", id);

        const student = await studentModel.findOne({ student_id: id }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

        if (!student) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        return res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: student });

    } catch (error) {
        console.error("getStudentById error", error);

        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const updateStudentHandler = async (req, res) => {
    try {

        const { error } = updateStudentValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
        }

        const id  = req.body.id;
        const updateData = req.body;
        const updatedStudent = await studentModel.findOneAndUpdate(
            { student_id: id },
            { $set: updateData },
            { new: true, runValidators: true },
            { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
        );

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        return res.status(200).json({ success: true, message: req.t("common.updated_successfully"), data: updatedStudent });

    } catch (error) {
        console.error('updateStudent error', error);

        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const deleteStudentHandler = async (req, res) => {
    try {

        const id = req.body.id
        const deletedStudent = await studentModel.findOneAndDelete({ student_id: id });
        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }
        return res.status(200).json({ success: true, message: req.t("common.deleted"), data: '' });

    } catch (error) {
        console.error("deleteStudent error", error);

        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const addParticipationToStudentHandler = async (req, res) => {
    try {
        const id  = req.body.id;
        const { participation } = req.body;

        if (!participation) {
            return res.status(400).json({ success: false, message: req.t("student.student_participation_required"), data: '' });
        }

        const student = await studentModel.findOne({ student_id: id });
        if (!student) {
            return res.status(404).json({ success: false, message: req.t("student.student_participation_required"), data: '' });
        }
        if (!Array.isArray(student.participation)) {
            student.participation = [];
        }
        const newParticipations = Array.isArray(participation) ? participation : [participation];
        const uniqueParticipations = newParticipations.filter(p => !student.participation.includes(p));

        if (uniqueParticipations.length === 0) {
            return res.status(400).json({
                success: false,
                message: req.t("student.students_provided_participation_exist"),
                data: ''
            });
        }

        student.participation.push(...uniqueParticipations);
        await student.save();
        return res.status(200).json({ success: true, message: req.t("common.added_successfully"), data: '' });
    } catch (error) {
        console.error("addParticipationToStudent error", error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const acceptStudentByIdHandler = async (req, res) => {
    try {

        const id  = req.body.id;

        const student = await studentModel.findOneAndUpdate({ student_id: id }, { status: 'Approved' }, { new: true });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found", data: '' });
        }

        return res.status(200).json({ success: true, message: "Student accepted successfully", data: '' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: '' });
    }
};

const rejectStudentByIdHandler = async (req, res) => {
    try {
        const id  = req.body.id;

        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: "reason is required to reject a student", data: '' });
        }

        const student = await studentModel.findOneAndUpdate({ student_id: id }, { status: 'Rejected', reason }, { new: true });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found", data: '' });
        }

        return res.status(200).json({ success: true, message: "Student rejected successfully", data: student.reason });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: '' });
    }
}

const generateStudentQR = async (req, res) => {
  try {
    // Accept id/type from query, body, or params to be flexible
    const source = (req.method === 'GET' ? req.query : req.body) || {};
    const id = source.id;
    const type = source.type || 'public';

    if (!id) {
      return res.status(400).json({ success: false, message: 'id is required', data: '' });
    }

    if (!["public", "private"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'public' or 'private'.",
        data: "",
      });
    }

    const student = await studentModel.findOne({ student_id: id }).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found", data: "" });
    }

    const BASE_URL = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    // determine language for private view
    const language = req.headers["accept-language"]?.split(",")[0] || 'en';

    // build payload and encrypt it
    const payload = JSON.stringify({ id: student.student_id, type, lang: type === 'public' ? 'ar' : language });
    const token = encrypt(payload);

    // Link to the public view route under the same API prefix; client will call view with ?q=<token>
    const viewUrl = `${BASE_URL}/v1/api/students/view?q=${encodeURIComponent(token)}`;

    const qrCodeDataURL = await QRCode.toDataURL(viewUrl, { errorCorrectionLevel: 'H', width: 300 });

    return res.status(200).json({ success: true, message: `QR code generated successfully for ${type} view`, type, qrLink: viewUrl, qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('❌ QR Generation Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while generating QR code', data: '' });
  }
};

const viewStudentTemplate = async (req, res) => {
  try {
    // Support encrypted token (?q=...) or plain query params for backward compatibility
    const token = req.query.q || req.query.token;
    let id, type, lang;

    if (token) {
      try {
        const decrypted = decrypt(decodeURIComponent(token));
        const parsed = JSON.parse(decrypted);
        id = parsed.id;
        type = parsed.type;
        lang = parsed.lang;
      } catch (err) {
        console.error('Failed to decrypt token:', err);
        return res.status(400).send('<h2>Invalid or expired link</h2>');
      }
    } else {
      // fallback to older query style
      id = req.query.id || req.params.id || req.body.id;
      type = req.query.type || req.body.type || 'private';
      lang = req.query.lang || req.body.lang;
    }

    const student = await studentModel.findOne({ student_id: id }).lean();
    if (!student) return res.status(404).send('<h2>Student not found</h2>');

    const isPublic = type === 'public';

    // Handle localization (private view only)
    if (!isPublic && lang) req.i18n.changeLanguage(lang);

    // 🧩 Public Arabic fields
    const publicData = {
      "fa-id-card": ["الرقم الجامعي", student.student_id],
      "fa-user": ["الاسم", `${student.first_name} ${student.second_name} ${student.last_name}`],
      "fa-university": ["الجامعة", student.university_name],
      "fa-hotel": ["عنوان السكن", student.hotel_address || "غير متوفر"],
      "fa-flag": ["الجنسية", student.nationltiy || "غير متوفر"],
      "fa-users": ["نوع المشاركة", "طالب"],
      "fa-circle-check": ["الحالة", student.isActive ? "مفعل" : "غير مفعل"],
      "fa-phone": ["رقم الطوارئ", student.emergency_contact || "غير متوفر"],
    };

    // 🧩 Private — pulled from locales
    const privateData = {
      "fa-id-card": [req.t("student.id"), student.student_id],
      "fa-user": [req.t("student.name"), `${student.first_name} ${student.second_name} ${student.last_name}`],
      "fa-university": [req.t("student.university"), student.university_name],
      "fa-hotel": [req.t("student.hotelAddress"), student.hotel_address || req.t("common.notAvailable")],
      "fa-flag": [req.t("student.nationality"), student.nationltiy || req.t("common.notAvailable")],
      "fa-envelope": [req.t("student.email"), student.student_email || req.t("common.notAvailable")],
      "fa-mobile": [req.t("student.phone"), student.student_phone || req.t("common.notAvailable")],
      "fa-futbol": [
        req.t("student.sports"),
        Array.isArray(student.participation)
          ? student.participation.join(", ")
          : student.participation || req.t("common.notAvailable")
      ],
      "fa-info-circle": [req.t("student.status"), student.status || req.t("common.notAvailable")],
    };

    const fields = isPublic ? publicData : privateData;

    const dataHTML = Object.entries(fields)
      .map(
        ([icon, [label, value]]) => `
          <div class="info">
            <span><i class="fa-solid ${icon}"></i> ${label}:</span> ${value}
          </div>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${isPublic ? "ar" : lang || "en"}" dir="${isPublic ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${isPublic ? "الملف العام للطالب" : req.t("student.privateDetails")}</title>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

        <style>
          body {
            font-family: "Poppins", Arial, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 650px;
            margin: 50px auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          }
          h2 {
            text-align: center;
            color: #1a73e8;
            margin-bottom: 10px;
          }
          h4 {
            text-align: center;
            color: #555;
            font-weight: 500;
            margin-bottom: 30px;
          }
          .info {
            background: #f8f9fa;
            padding: 10px 15px;
            margin: 8px 0;
            border-radius: 8px;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
          }
          .info span {
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .info i {
            color: #1a73e8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎓 ${student.university_name}</h2>
          <h4>${isPublic ? "الملف العام للطالب" : req.t("student.privateDetails")}</h4>
          ${dataHTML}
        </div>
      </body>
      </html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("❌ Template Render Error:", error);
    res.status(500).send("<h2>Internal server error</h2>");
  }
};


module.exports = {
    addStudentHandler, getStudentsHandler, getStudentByIdHandler, updateStudentHandler,
    deleteStudentHandler, addParticipationToStudentHandler, acceptStudentByIdHandler, rejectStudentByIdHandler,
    generateStudentQR, viewStudentTemplate
};
