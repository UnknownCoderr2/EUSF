const express = require('express');
const studentsRouter = express.Router();
const { requireMongoUser } = require("../middleware/requireMongoUser");

const {
    addStudentHandler,
    getStudentsHandler,
    getStudentByIdHandler,
    updateStudentHandler,
    deleteStudentHandler,
    addParticipationToStudentHandler,
    acceptStudentByIdHandler,
    rejectStudentByIdHandler,
    generateStudentQR,
    viewStudentTemplate
} = require('../controllers/students.controller');
const { uploadImage } = require('../middleware/uploadImage');

const requireMongoUserMiddleware = process.env.NODE_ENV === 'production'
    ? requireMongoUser
    : (req, res, next) => next();

studentsRouter.route('/').post(
    requireMongoUserMiddleware,
    uploadImage.fields([
        { name: 'nationalId_image', maxCount: 1 },
        { name: 'universityId_image', maxCount: 1 },
        { name: 'personal_image', maxCount: 1 },
        { name: 'medical_image', maxCount: 1 },
        { name: 'passport_image', maxCount: 1 },
        { name: 'registeration_form_image', maxCount: 1 }
    ]),
    addStudentHandler);

studentsRouter.route('/all').get(requireMongoUserMiddleware, getStudentsHandler);
studentsRouter.route('/id').post(requireMongoUserMiddleware, getStudentByIdHandler);
studentsRouter.route('/edit').patch(requireMongoUserMiddleware, updateStudentHandler);
studentsRouter.route('/delete').delete(requireMongoUserMiddleware, deleteStudentHandler);
studentsRouter.route('/participations').post(requireMongoUserMiddleware, addParticipationToStudentHandler);
studentsRouter.route('/accept').post(requireMongoUserMiddleware, acceptStudentByIdHandler);
studentsRouter.route('/reject').post(requireMongoUserMiddleware, rejectStudentByIdHandler);
studentsRouter.route('/qrcode').get(requireMongoUserMiddleware, generateStudentQR);
studentsRouter.route('/view').get(requireMongoUserMiddleware, viewStudentTemplate);


module.exports = {
    studentsRouter,
};
