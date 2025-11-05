const userModel = require("../models/user.model");
const { getUserIdFromSession } = require("../helpers/GetUserInfoFromSessionID");
const { exportToExcel } = require("../utils/excelExport");


const getAllUsers = async (req, res) => {
    try {
        const excel = req.query.excel;
        if(excel === 'true'){
            const userforexcel = await userModel.find({}, {
                password: 0,
                _id: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0
            })
            const excelData = userforexcel.map(user => ({
                'First Name': user.first_name,
                'Second Name': user.second_name,
                'Last Name': user.last_name,
                'Role': user.role,
                'Email': user.email,
                'University': user.university_name,
                'Phone': user.phone_number,
                'Nationality': user.nationality,
                'Birth Date': user.DateofBirth ? new Date(user.DateofBirth).toLocaleDateString('en-GB') : '',
                'Active': user.isActive ? 'Yes ✔️' : 'No ❌',
            }));
            const colWidths = [
                { wch: 15 }, // First Name
                { wch: 15 }, // Second Name
                { wch: 15 }, // Last Name
                { wch: 15 }, // Role
                { wch: 30 }, // Email
                { wch: 25 }, // University
                { wch: 15 }, // Phone
                { wch: 12 }, // Nationality
                { wch: 15 }, // Birth Date
                { wch: 10 },  // Active
            ];
            exportToExcel(excelData, 'users', colWidths, res);
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const data = await userModel
            .find({}, {
                password: 0,
                _id: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0
            })
            .skip(skip)
            .limit(limit);
        return res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: '' });
    }
};

const GetUserInfo = async (req, res) => {
    try {
        const sessionid = req.headers.sessionid;
        if (!sessionid) {
            return res.status(400).json({ success: false, message: req.t("auth.seesion_id_required"), data: '' });
        }

        const userId = await getUserIdFromSession(sessionid);
        if (!userId) {
            return res.status(401).json({ success: false, message: req.t("auth.invalid_expired_session"), data: '' });
        }

        const user = await userModel.findById(
            userId,
            {
                password: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0
            }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        return res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: user });
    } catch (error) {
        console.error('GetUserInfo error', error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const updateUserByIdHandler = async (req, res) => {
    try {
        const userId = req.body;
        const updateData = { ...req.body };

        delete updateData.loginVerified;

        let emailChanged = false;
        if (updateData.email) {
            const eduRegex = /@(\w+\.)?(edu|ac|eg)(\.[a-z]{2,})?$/i;
            if (!eduRegex.test(updateData.email)) {
                return res.status(400).json({ success: false, message: req.t("user.educational_email"), data: '' });
            }
            const existingUser = await userModel.findOne({ email: updateData.email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: req.t("user.user_exists"), data: '' });
            }
            emailChanged = true;
        }

        if (emailChanged) {
            const toUpdate = { ...updateData};
            const updatedUser = await userModel.findByIdAndUpdate(userId, toUpdate, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
            }

            return res.status(200).json({ success: true, message: req.t("user.verify_new_email"), data: updatedUser });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }
        res.status(200).json({ success: true, message: req.t("common.updated_successfully"), data: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, data: '' });
    }
};

const GetUserInfoByEmailHandler = async (req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const user = await userModel.findOne(
            { email },
            {
                password: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0
            }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }
        return res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: user });
    } catch (error) {
        console.error('GetUserInfoByEmail error', error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
};

const getRepresentativeEmailsHandler = async (req, res) => {
    try {
        const representatives = await userModel.find(
            { role: "university representative" },
            { email: 1, _id: 0 }
        );
        const emails = representatives.map(rep => rep.email);
        return res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: emails });
    } catch (error) {
        console.error('getRepresentativeEmailsHandler error', error);
        return res.status(500).json({ success: false, message: req.t("common.Internal_error"), data: '' });
    }
}


module.exports = { getAllUsers, GetUserInfo,updateUserByIdHandler,GetUserInfoByEmailHandler,getRepresentativeEmailsHandler };
