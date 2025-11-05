const { requireMongoUser } = require("../middleware/requireMongoUser");
const { allowedRoles } = require("../middleware/rolesCheck");

const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

const requireallowedRole = process.env.NODE_ENV === 'production'
    ? allowedRoles
    : (req, res, next) => next();


const statisticsRouter = require("express").Router();
const{ getUniversitiesByMedalsHandler, getActiveUsersStats,getRegisteredStudentsStats,getRegisteredUniversitiesStats } = require("../controllers/statistics.controller");

statisticsRouter.route('/top-performing-universities').get(requireMongoUserMiddleware, getUniversitiesByMedalsHandler);
statisticsRouter.route('/active-users').get(requireMongoUserMiddleware, getActiveUsersStats);
statisticsRouter.route('/registered-students').get(requireMongoUserMiddleware, getRegisteredStudentsStats);
statisticsRouter.route('/registered-universities').get(requireMongoUserMiddleware, getRegisteredUniversitiesStats);

module.exports = { statisticsRouter };