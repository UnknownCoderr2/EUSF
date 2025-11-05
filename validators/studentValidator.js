const Joi = require('joi');

const registerStudentValidationSchema = Joi.object({
        student_id: Joi.string()
                .required()
                .messages({
                        'string.empty': "student.student_id_required"
                }),

        first_name: Joi.string()
                .min(3)
                .max(50)
                .required()
                .messages({
                        'string.min': 'common.name_validation',
                        'string.empty': 'common.name_required'
                }),

        second_name: Joi.string()
                .min(3)
                .max(50)
                .required()
                .messages({
                        'string.min': 'common.name_validation',
                        'string.empty': 'common.name_required'
                }),

        last_name: Joi.string()
                .min(3)
                .max(50)
                .required()
                .messages({
                        'string.min': 'common.name_validation',
                        'string.empty': 'common.name_required'
                }),

        national_id: Joi.string()
                .min(6)
                .max(20)
                .required()
                .messages({
                        'string.min': 'common.national_id_validation',
                        'string.empty': 'common.national_id_required'
                }),

        birth_date: Joi.date()
                .required()
                .messages({
                        'date.base': 'common.birthdate_validation',
                        'string.empty': 'common.birthdate_required'
                }),

        gender: Joi.string()
                .valid("male", "female")
                .required()
                .messages({
                        'any.only': 'common.gender_validation',
                        'string.empty': 'common.gender_required'
                }),

        faculty: Joi.string()
                .max(100)
                .required()
                .messages({
                        'string.max': 'student.faculty_validation',
                        'string.empty': 'student.faculty_required'
                }),
        year_level: Joi.number()
                .integer()
                .min(1)
                .max(10)
                .required()
                .messages({
                        'number.base': 'student.year_level_type',
                        'number.min': 'student.year_level_min',
                        'number.max': 'student.year_level_max',
                        'any.required': 'student.year_level_required'
                }),
        student_phone: Joi.string()
                .pattern(/^\d{10,15}$/)
                .required()
                .messages({
                        'string.pattern.base': 'common.phone_validation',
                        'string.empty': 'common.phone_required'
                }),
        student_email: Joi.string()
                .email()
                .pattern(/\.edu(\.[a-z]{2})?$/)
                .required()
                .messages({
                        'string.email': 'common.email_validation',
                        'string.pattern.base': 'common.educational_email',
                        'string.empty': 'common.email_required'
                }),

        university_name: Joi.string()
        .max(255)
        .messages({
        'string.max': 'common.university_name_validation',
        'string.empty': 'common.university_name_required'
        }),

        emergency_contact: Joi.string()
        .required()
        .messages({
        'string.empty': 'common.emergency_contact_required'
        }),

        hotel_address: Joi.string()
                .allow('')
                .optional(),

        nationltiy: Joi.string()
        .required()
        .messages({
        'string.empty': 'common.nationality_required'
        }),

        Paralympic: Joi.boolean()
        .optional()

});

const updateStudentValidationSchema = Joi.object({
        student_id: Joi.string()
                .messages({
                        'string.empty': "student.student_id_required"
                }),
        first_name: Joi.string()
                .min(3)
                .max(50)
                .messages({
                        'string.min': 'common.name_validation',
                }),
        second_name: Joi.string()
                .min(3)
                .max(50)
                .messages({
                        'string.min': 'common.name_validation',
                }),
        last_name: Joi.string()
                .min(3)
                .max(50)
                .messages({
                        'string.min': 'common.name_validation',
                }),
        national_id: Joi.string()
                .min(6)
                .max(20)
                .messages({
                        'string.min': 'common.national_id_validation',
                }),
        birth_date: Joi.date()
                .messages({
                        'date.base': 'common.birthdate_validation',
                }),
        gender: Joi.string()
                .valid("male", "female")
                .messages({
                        'any.only': 'common.gender_validation',
                }),
        faculty: Joi.string()
                .max(100)
                .messages({
                        'string.max': 'student.faculty_validation'
                }),
        year_level: Joi.number()
                .integer()
                .min(1)
                .max(10)
                .messages({
                        'number.base': 'student.year_level_type',
                        'number.min': 'student.year_level_min',
                        'number.max': 'student.year_level_max',
                }),
        student_phone: Joi.string()
                .pattern(/^\d{10,15}$/)
                .messages({
                        'string.pattern.base': 'common.phone_validation',
                }),
        student_email: Joi.string()
                .email()
                .pattern(/\.edu(\.[a-z]{2})?$/)
                .messages({
                        'string.email': 'common.email_validation',
                        'string.pattern.base': 'common.educational_email',
                }),

        university_name: Joi.string()
                .max(255)
                .messages({
                        'string.max': 'common.university_name_validation'
                }),

        id: Joi.string()
        .required()
        .messages({
                'string.empty': 'studentId_required',
                'any.required': 'studentId_required'
        }),
});

module.exports = { registerStudentValidationSchema, updateStudentValidationSchema };