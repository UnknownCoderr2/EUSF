const Joi = require('joi');

const loginValidationSchema = Joi.object({
    email: Joi.string()
        .email()
        .pattern(/\.edu(\.[a-z]{2})?$/)
        .required()
        .messages({
        'string.email': 'common.email_validation',
        'string.pattern.base': 'common.educational_email',
    }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'common.Password_validation',
        'string.empty': 'common.password_required'
    })

});

module.exports = { loginValidationSchema };