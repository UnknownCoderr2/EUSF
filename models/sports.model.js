const mongoose = require("mongoose");

const SportsSchema = new mongoose.Schema({
    name_ar: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name_en: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    sportType: {
        type: String,
        enum: ['individual', 'team'],
        required: true,
        trim: true
    },

    minAge: {
        type: Number,
        required: true,
    },

    maxAge: {
        type: Number,
        required: true,
    },

    competitions: {
        male: [String],
        female: [String]
    },
    maxMaleParticipants: {
        type: Number,
        required: function () {
            return this.sportType === 'individual';
        }
    },
    maxFemaleParticipants: {
        type: Number,
        required: function () {
            return this.sportType === 'individual';
        }
    },
    maxTeamMembers: {
        type: Number,
        required: function () {
            return this.sportType === 'team';
        }
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
});

// to ensure that sport names are unique in both languages
SportsSchema.index({ name_ar: 1 }, { unique: true });
SportsSchema.index({ name_en: 1 }, { unique: true });

const SportsModel = mongoose.model("Sports", SportsSchema);

module.exports = { SportsModel };