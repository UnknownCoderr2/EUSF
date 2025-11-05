const Joi = require('joi');

const registerValidationSchema = Joi.object({
    first_name: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
            'string.min': 'common.name_validation',
            'string.empty': 'common.name_required'}),

    second_name: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
            'string.min': 'common.name_validation',
            'string.empty': 'common.name_required'}),

    last_name: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
            'string.min': 'common.name_validation',
            'string.empty': 'common.name_required'}),

    email: Joi.string()
        .email()
        .pattern(/\.edu(\.[a-z]{2})?$/)
        .required()
        .messages({
        'string.empty': 'common.email_required',
        'string.email': 'common.email_validation',
        'string.pattern.base': 'common.educational_email'
    }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'common.Password_validation',
        'string.empty': 'common.password_required'
    }),

    role: Joi.string()
            .valid("admin", "super admin", "university representative", "voulanteer" , "referee")
            .required()
            .messages({
            'any.only': 'common.role_validation',
            'string.empty': 'common.role_required'
        }),
    phone_number: Joi.string()
            .pattern(/^[0-9]{7,15}$/)
            .required()
            .messages({
            'string.pattern.base': 'common.phone_validation',
            'string.empty': 'common.phone_required'
        }),

    nationality: Joi.string()
            .required()
            .messages({
            'string.empty': 'common.nationality_required'
        }),
    DateofBirth: Joi.date()
            .required()
            .messages({
            'date.base': 'common.birthdate_validation',
            'any.required': 'common.birthdate_required'
        }),

    university_name: Joi.string()
        .required()
        .max(255)
        .messages({
        'string.max': 'common.university_name_validation',
        'string.empty': 'common.university_name_required'

    })
});

module.exports = { registerValidationSchema };