const universityModule = require("../models/university.model");
const studentModel = require("../models/students.model");
const userModel = require("../models/user.model");

const getRegisteredUniversitiesStats = async (req, res) => {
    try {
        const totalUniversities = await universityModule.countDocuments();
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: { totalUniversities } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
};

const getRegisteredStudentsStats = async (req, res) => {
    try {
        const totalStudents = await studentModel.countDocuments();
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: { totalStudents } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
};

const getActiveUsersStats = async (req, res) => {
    try {
        // calculate threshold (users active within last 2 days)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // pagination: page query, fixed limit = 6
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = 6;
        const skip = (page - 1) * limit;

        const filter = { lastLoginAt: { $gte: twoDaysAgo } };

        const total = await userModel.countDocuments(filter);
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        // fetch users sorted by lastLoginAt descending with pagination
        const users = await userModel
            .find(filter, { password: 0, __v: 0 })
            .sort({ lastLoginAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: req.t("common.fetched_successfully"),
            data: users,
            meta: { total, page, limit, totalPages }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
};


const getUniversitiesByMedalsHandler = async (req, res) => {
    try {
        // pagination params
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const total = await universityModule.countDocuments();
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        // fetch universities sorted by total_medals desc
        const universities = await universityModule
            .find({}, { name_en: 1, name_ar: 1, UniversityCode: 1, medals: 1 })
            .sort({ 'medals.total_medals': -1 })
            .skip(skip)
            .limit(limit);

        // attach rank based on overall ordering
        const ranked = universities.map((u, idx) => {
            const obj = u.toObject();
            obj.rank = skip + idx + 1;
            return obj;
        });

        res.status(200).json({
            success: true,
            message: req.t('common.fetched_successfully'),
            data: ranked,
            meta: { total, page, limit, totalPages }
        });
    } catch (err) {
        console.error('getUniversitiesByMedalsHandler error', err);
        res.status(500).json({ success: false, message: req.t('common.Internal_error'), data: '' });
    }
};

module.exports = {
    getRegisteredUniversitiesStats,
    getRegisteredStudentsStats,
    getActiveUsersStats,
    getUniversitiesByMedalsHandler
};