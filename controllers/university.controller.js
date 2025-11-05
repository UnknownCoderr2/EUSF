const universityModule = require("../models/university.model");
const studentModel = require("../models/students.model");
const userModel = require("../models/user.model");
const { createUniversityValidationSchema, updateUniversityValidationSchema } = require("../validators/universityValidator");


const addUniversityHandler = async (req, res) => {
    //  Validate request body
    const { error } = createUniversityValidationSchema.validate(req.body);

    if (error) {
        console.log(error.details[0].message);
        return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
    }

    try {
        const existingUser = await userModel.findOne({
            email: req.body.representative_email,
            role: "university representative"
        });

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: req.t("university.representative_email_not_found"),
                data: ''
            });
        }

        const existingCode = await universityModule.findOne({ UniversityCode: req.body.UniversityCode });
        if (existingCode) {
            return res.status(400).json({ success: false, message: req.t("university.university_code_exists"), data: '' });
        }

        const university = new universityModule({
            name_ar: req.body.name_ar,
            name_en: req.body.name_en,
            country: req.body.country,
            UniversityCode: req.body.UniversityCode,
            representative_name: existingUser.first_name + " " + existingUser.second_name + " " + existingUser.last_name,
            representative_email: req.body.representative_email,
            representative_phone: existingUser.phone_number
        })

        await university.save();

        res.status(201).json({ success: true, message: req.t("common.created_successfully"), data: university });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
}

const updateUniversityHandler = async (req, res) => {

    const { error } = updateUniversityValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
    }

    try {

        const universityId = req.body.universityId;
        const existingUniversity = await universityModule.findById(universityId);
        if (!existingUniversity) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        const updateData = { ...req.body };
        delete updateData.representative_name;
        delete updateData.representative_phone;

        if (updateData.UniversityCode && updateData.UniversityCode !== existingUniversity.UniversityCode) {
            const codeExists = await universityModule.findOne({ UniversityCode: updateData.UniversityCode });
            if (codeExists) {
                return res.status(400).json({ success: false, message: req.t("university.university_code_exists"), data: '' });
            }
        }

        const updatedUniversity = await universityModule.findByIdAndUpdate(universityId, updateData, { new: true });

        res.status(200).json({ success: true, message: req.t("common.updated_successfully"), data: updatedUniversity });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
}

const deleteUniversityHandler = async (req, res) => {
    try {
        const universityId = req.body.universityId;

        const deletedUniversity = await universityModule.findByIdAndDelete(universityId);

        if (!deletedUniversity) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        res.status(200).json({ success: true, message: req.t("common.deleted"), data: '' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });

    }
}

const getAllUniversitiesHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await studentModel.countDocuments();
        const totalPages = Math.max(Math.ceil(total / limit), 1);
        const universities = await universityModule
            .find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: { universities } ,
        meta: {
                total,
                page,
                limit,
                totalPages
            } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
}

const getUniversityByIdHandler = async (req, res) => {
    try {

        const universityId = req.body.universityId;

        const university = await universityModule.findById(universityId, { createdAt: 0, updatedAt: 0, __v: 0 });
        if (!university) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: university });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });

    }
}

const getAllUniversitiesNamesHandler = async (req, res) => {
    try {
        const universities = await universityModule.find({}, 'name_en -_id');

        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: universities });
    } catch (err) {
        res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });

    }
}

const getStudentsByUniversityHandler = async (req, res) => {
    try {
        const universityName = req.body.universityName;

        const students = await studentModel.find({ university_name: universityName, status: 'Pending' }, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: students });
    } catch (err) {
        res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });

    }
}

const IncrementUniversityMedalsHandler = async (req, res) => {
    try {
        const universityId = req.body.universityId;
        const { medalType } = req.body;

        // 1️⃣ Validate input
        if (!['gold', 'silver', 'bronze'].includes(medalType)) {
            return res.status(400).json({ success: false, message: req.t("university.invalid_medal_type"), data: '' });
        }

        // 2️⃣ Find university
        const university = await universityModule.findById(universityId);
        if (!university) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), date: '' });
        }

        // 3️⃣ Ensure medals object exists
        if (!university.medals) {
            university.medals = { gold: 0, silver: 0, bronze: 0, total_medals: 0, rank: 0 };
        }

        // 4️⃣ Increment the specific medal
        university.medals[medalType] += 1;

        // 5️⃣ Recalculate total medals
        university.medals.total_medals =
            university.medals.gold + university.medals.silver + university.medals.bronze;

        // 6️⃣ Save
        await university.save();

        // 7️⃣ Respond
        res.status(200).json({ success: true, message: req.t("university.medal_incremented"), data: university.medals });

    } catch (error) {
        console.error('Error incrementing medal:', error);
        res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: error.message });
    }
};

module.exports = {
    addUniversityHandler,
    updateUniversityHandler,
    deleteUniversityHandler,
    getUniversityByIdHandler,
    getAllUniversitiesHandler,
    getStudentsByUniversityHandler,
    getAllUniversitiesNamesHandler,
    IncrementUniversityMedalsHandler
};
