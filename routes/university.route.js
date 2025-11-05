const { addUniversityHandler,
    updateUniversityHandler,
    deleteUniversityHandler,
    getStudentsByUniversityHandler,
    getAllUniversitiesHandler,
    getUniversityByIdHandler,
    getAllUniversitiesNamesHandler,
    IncrementUniversityMedalsHandler } = require("../controllers/university.controller");

const { requireMongoUser } = require("../middleware/requireMongoUser");
const{ allowedRoles }=require("../middleware/rolesCheck");
const universityRouter = require("express").Router();


const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

const requireallowedRole = process.env.NODE_ENV === 'production'
    ? allowedRoles
    : (req, res, next) => next();

universityRouter.route('/').post(requireMongoUserMiddleware,addUniversityHandler);
universityRouter.route('/all').post(requireMongoUserMiddleware,getAllUniversitiesHandler);
universityRouter.route('/names').get(requireMongoUserMiddleware, getAllUniversitiesNamesHandler);
universityRouter.route('/delete').delete(requireMongoUserMiddleware, deleteUniversityHandler);
universityRouter.route("/edit").patch(requireMongoUserMiddleware, updateUniversityHandler);
universityRouter.route("/id").post(requireMongoUserMiddleware, getUniversityByIdHandler);
universityRouter.route('/increment-medals').patch(requireMongoUserMiddleware, IncrementUniversityMedalsHandler);
universityRouter.route('/students').get(requireMongoUserMiddleware, getStudentsByUniversityHandler);



module.exports = { universityRouter };