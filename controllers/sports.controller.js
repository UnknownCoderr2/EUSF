const { SportsModel } = require("../models/sports.model");
const { createSportValidationSchema, updateSportValidationSchema } = require("../validators/sport.validator");


const addSportHandler = async (req, res) => {

    // Validate request body
    const { error } = createSportValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
    }

    try {
        const sport = new SportsModel({
            name_ar: req.body.name_ar,
            name_en: req.body.name_en,
            sportType: req.body.sportType,
            minAge: req.body.minAge,
            maxAge: req.body.maxAge,
            competitions: req.body.competitions,
            maxMaleParticipants: req.body.maxMaleParticipants,
            maxFemaleParticipants: req.body.maxFemaleParticipants,
            maxTeamMembers: req.body.maxTeamMembers
        });

        await sport.save();

        res.status(201).json({ success: true, message: req.t("created_successfully"), data: sport });

    } catch (error) {
        console.error("addSport error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}

// get all sports information
const getSportsHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const sports = await SportsModel
            .find({}, { __v: 0 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: sports });
    } catch (error) {
        console.log("getSports error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}

//get all sports Names
const getSportsNamesHandler = async (req, res) => {
    try {
        const sports = await SportsModel.find({}, { name_ar: 1, name_en: 1, _id: 0 });
        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: sports });
    } catch (error) {
        console.error("getSportsNames error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}

//get sport by id
const getSportByIdHandler = async (req, res) => {
    try {
        const sportId = req.params.id;
        const sport = await SportsModel.findById(sportId, { __v: 0 });

        if (!sport) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        res.status(200).json({ success: true, message: req.t("common.fetched_successfully"), data: sport });
    } catch (error) {
        console.error("getSportById error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}

// delete sport by id
const deleteSportByIdHandler = async (req, res) => {
    try {
        const sportId = req.params.id;
        const deletedSport = await SportsModel.findByIdAndDelete(sportId);

        if (!deletedSport) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }
        res.status(200).json({ success: true, message: req.t("common.deleted"), data: '' });
    } catch (error) {
        console.error("deleteSportById error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}

// update sport by id
const updateSportByIdHandler = async (req, res) => {
    // Validate request body
    const { error } = updateSportValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: req.t(error.details[0].message), data: '' });
    }

    try {
        const sportId = req.params.id;
        const sport = await SportsModel.findById(sportId);
        if (!sport) {
            return res.status(404).json({ success: false, message: req.t("common.Not_found"), data: '' });
        }

        if (sport.sportType === 'team' && (req.body.competitions || req.body.maxMaleParticipants || req.body.maxFemaleParticipants)) {
            return res.status(400).json({ success: false, message: req.t("sport.sports_cant_update"), data: '' });
        }

        if (sport.sportType === 'individual' && req.body.maxTeamMembers) {
            return res.status(400).json({ success: false, message: req.t("sport.sports_cant_update_single"), data: '' });
        }

        const updatedSport = await SportsModel.findByIdAndUpdate(sportId, { $set: req.body }, { new: true, runValidators: true });

        res.status(200).json({ success: true, message: req.t("common.updated_successfully"), data: updatedSport });
    } catch (error) {
        console.error("updateSportById error", error.message);
        res.status(500).json({ success: false, message: req.t("Internal_error"), data: '' });
    }
}



module.exports = { addSportHandler, getSportsHandler, getSportsNamesHandler, getSportByIdHandler, deleteSportByIdHandler, updateSportByIdHandler };