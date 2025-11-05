const { addSportHandler, getSportByIdHandler, getSportsHandler, getSportsNamesHandler, deleteSportByIdHandler, updateSportByIdHandler } = require("../controllers/sports.controller");
const { requireMongoUser } = require("../middleware/requireMongoUser");

const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

const sportsRouter = require("express").Router();

sportsRouter.route("/").post(requireMongoUserMiddleware, addSportHandler);
sportsRouter.route("/").get(requireMongoUserMiddleware, getSportsHandler);
sportsRouter.route("/names").get(requireMongoUserMiddleware, getSportsNamesHandler);
sportsRouter.route("/:id").get(requireMongoUserMiddleware, getSportByIdHandler);
sportsRouter.route("/:id").patch(requireMongoUserMiddleware, updateSportByIdHandler);
sportsRouter.route("/:id").delete(requireMongoUserMiddleware, deleteSportByIdHandler);

module.exports = { sportsRouter };