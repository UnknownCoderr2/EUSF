const Joi = require('joi');

const createUniversityValidationSchema = Joi.object({

    name_ar: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'university.university_name_required',
            'any.required': 'university.university_name_required'
        }),
    name_en: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'university.university_name_required',
            'any.required': 'university.university_name_required'
        }),

    country: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'university.min_country',
            'string.max': 'university.max_country',
            'string.empty': 'university.country_required',
            'any.required': 'university.country_required'
        }),

    UniversityCode: Joi.string()
        .required()
        .messages({
            'string.empty': 'university.universityCode_required',
            'any.required': 'university.universityCode_required'
        }),

    representative_email: Joi.string()
        .email()
        .pattern(/\.edu(\.[a-z]{2})?$/)
        .required()
        .messages({
            'string.email': 'common.email_validation',
            'string.pattern.base': 'common.educational_email',
            'string.empty': 'common.email_required',
            'any.required': 'common.email_required'
        }),

});

const updateUniversityValidationSchema = Joi.object({
    name_ar: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'university.university_name_required',
        }),

    name_en: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'university.university_name_required',
        }),

    country: Joi.string()
        .min(2)
        .max(100)
        .messages({
            'string.min': 'university.min_country',
            'string.max': 'university.max_country',
            'string.empty': 'university.country_required',
        }),

    UniversityCode: Joi.string()
        .messages({
            'string.empty': 'university.universityCode_required',
        }),

    representative_name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'university.representative_name_required',
        }),

    representative_email: Joi.string()
        .email()
        .pattern(/\.edu(\.[a-z]{2})?$/)
        .messages({
            'string.email': 'common.email_validation',
            'string.pattern.base': 'common.educational_email',
            'string.empty': 'common.email_required',
        }),

    representative_phone: Joi.string()
        .min(11)
        .max(12)
        .messages({
            'string.empty': 'common.phone_required',
        }),
    universityId: Joi.string()
        .required()
        .messages({
            'string.empty': 'universityId_required',
            'any.required': 'universityId_required'
        }),
});

module.exports = { createUniversityValidationSchema, updateUniversityValidationSchema };