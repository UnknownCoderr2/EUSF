const express = require("express");
const usersRouter = express.Router();
const { requireMongoUser } = require("../middleware/requireMongoUser");

const { getAllUsers , GetUserInfo , updateUserByIdHandler  , GetUserInfoByEmailHandler,getRepresentativeEmailsHandler} = require("../controllers/users.controller");

const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

usersRouter.route("/").get(requireMongoUserMiddleware,getAllUsers);
usersRouter.route("/edit").patch(requireMongoUserMiddleware,updateUserByIdHandler);
usersRouter.route("/userInfo").get(requireMongoUserMiddleware,GetUserInfo);
usersRouter.route("/userInfo/email").post(requireMongoUserMiddleware,GetUserInfoByEmailHandler);
usersRouter.route("/representatives").get(requireMongoUserMiddleware,getRepresentativeEmailsHandler);

module.exports = {
  usersRouter,
};