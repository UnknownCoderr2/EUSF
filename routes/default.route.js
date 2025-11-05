const express = require("express");
const defaultRouter = express.Router();

const { requireMongoUser } = require("../middleware/requireMongoUser");
const { getAllCountryNamesHandler } = require("../controllers/default.controller");

const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

defaultRouter.route('/countries').get(requireMongoUserMiddleware, getAllCountryNamesHandler);

module.exports = { defaultRouter };