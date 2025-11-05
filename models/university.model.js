const mongoose = require('mongoose');

const medalsSchema = new mongoose.Schema({
    gold: {
        type: Number,
        default: 0
    },
    silver: {
        type: Number,
        default: 0
    },
    bronze: {
        type: Number,
        default: 0
    },
    total_medals: {
        type: Number,
        default: 0
    },
    rank:{
        type: Number,
        default: 0
    }
}, { _id: false });

const UniversityInfoSchema = new mongoose.Schema({
    name_ar: {
        type: String,
        required: true,
        trim: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    UniversityCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    representative_name: {
        type: String,
        required: true,
        trim: true
    },
    representative_email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    representative_phone: {
        type: String,
        required: true,
        trim: true,
        required: true,
    },
    Status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    medals: {
        type: medalsSchema,
        default: () => ({})
    },
    createdAtFormatted: {
        type: String,
        default: function () {
            const now = new Date();
            return now.toLocaleString('en-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }
    }
}, {
    timestamps: true
});



const universityModule = mongoose.model('Universities', UniversityInfoSchema);

module.exports = universityModule;
