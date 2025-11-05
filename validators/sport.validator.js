const Joi = require('joi');

const createSportValidationSchema = Joi.object({
    name_ar: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'sports.sport_name_required',
            'any.required': 'sports.sport_name_required'
        }),
    name_en: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation',
            'string.empty': 'sports.sport_name_required',
            'any.required': 'sports.sport_name_required'
        }),
    sportType: Joi.string()
        .valid('individual', 'team')
        .required()
        .messages({
            'any.only': 'sports.sport_type',
            'string.empty': 'sports.sport_type_required',
            'any.required': 'sports.sport_type_required'
        }),

    minAge: Joi.number()
        .required()
        .messages({
            'number.base': 'sports.age_type',
            'any.required': 'sports.age_min_required'
        }),
    maxAge: Joi.number()
        .min(Joi.ref('minAge'))
        .required()
        .messages({
            'number.min': 'sports.max_age_constraint',
            'number.base': 'sports.age_type',
            'any.required': 'sports.max_age_required'
        }),
    competitions: Joi.when('sportType', {
        is: 'individual',
        then: Joi.object({
            male: Joi.array()
                .items(Joi.string().min(1).max(100))
                .messages({
                    'array.base': 'sports.competitions_datatype',
                    'string.base': 'sports.competition_type',
                    'string.empty': 'sports.competition_requirded'
                }),

            female: Joi.array()
                .items(Joi.string().min(1).max(100))
                .messages({
                    'array.base': 'sports.competitions_datatype',
                    'string.base': 'sports.competition_type',
                    'string.empty': 'sports.competition_requirded'
                })
        })
            .required()
            .messages({
                'object.base': 'sports.competitions_format',
                'any.required': 'sports.competition_requirded'
            }),


        otherwise: Joi.forbidden()
    }),
    maxMaleParticipants: Joi.when('sportType', {
        is: 'individual',
        then: Joi.number()
            .min(1)
            .required()
            .messages({
                'number.base': 'sports.number_of_players_type',
                'number.min': 'sports.min_number_of_players',
                'any.required': 'sports.number_of_players_required'
            }),
        otherwise: Joi.forbidden()
    }),
    maxFemaleParticipants: Joi.when('sportType', {
        is: 'individual',
        then: Joi.number()
            .min(1)
            .required()
            .messages({
                'number.base': 'sports.number_of_players_type',
                'number.min': 'sports.min_number_of_players',
                'any.required': 'sports.number_of_players_required'
            }),
        otherwise: Joi.forbidden()
    }),

    maxTeamMembers: Joi.when('sportType', {
        is: 'team',
        then: Joi.number()
            .min(1)
            .required()
            .messages({
                'number.base': 'sports.number_of_players_type',
                'number.min': 'sports.min_number_of_players',
                'any.required': 'sports.number_of_players_required'
            }),
        otherwise: Joi.forbidden()
    })

});

const updateSportValidationSchema = Joi.object({
    name_ar: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'sports.sport_name_required'
        }),

    name_en: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'common.name_validation',
            'string.max': 'common.name_validation_max',
            'string.empty': 'sports.sport_name_required'
        }),

    sportType: Joi.string()
        .valid('individual', 'team')
        .messages({
            'any.only': 'sports.sport_type',
            'string.empty': 'sports.sport_type_required'
        }),

    minAge: Joi.number()
        .min(0)
        .messages({
            'number.base': 'sports.age_type',
            'number.min': 'sports.age_min_required'
        }),

    maxAge: Joi.number()
        .min(Joi.ref('minAge'))
        .messages({
            'number.min': 'sports.max_age_constraint',
            'number.base': 'sports.age_type'
        }),

    competitions: Joi.object({
        male: Joi.array()
            .items(Joi.string().min(1).max(100))
            .messages({
                'array.base': 'sports.competitions_datatype',
                'string.base': 'sports.competition_type',
                'string.empty': 'sports.competition_requirded'
            }),
        female: Joi.array()
            .items(Joi.string().min(1).max(100))
            .messages({
                'array.base': 'sports.competitions_datatype',
                'string.base': 'sports.competition_type',
                'string.empty': 'sports.competition_requirded'
            })
    }).messages({
        'object.base': 'sports.competitions_format'
    }),

    maxMaleParticipants: Joi.number()
        .min(1)
        .messages({
            'number.base': 'sports.number_of_players_type',
            'number.min': 'sports.min_number_of_players'
        }),

    maxFemaleParticipants: Joi.number()
        .min(1)
        .messages({
            'number.base': 'sports.number_of_players_type',
            'number.min': 'sports.min_number_of_players'
        }),

    maxTeamMembers: Joi.number()
        .min(1)
        .messages({
            'number.base': 'sports.number_of_players_type',
            'number.min': 'sports.min_number_of_players'
        })
})
    .min(1)
    .messages({
        'object.min': 'sports.at_least_one_field_required'
    });


module.exports = { createSportValidationSchema, updateSportValidationSchema };