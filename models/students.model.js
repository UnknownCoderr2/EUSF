const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    second_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    national_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    birth_date: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    university_name: {
        type: String,
        required: true,
    },
    faculty: {
        type: String,
        required: true,
        trim: true
    },
    year_level: {
        type: Number,
        required: true,
        trim: true
    },
    student_phone: {
        type: String,
        required: true,
        trim: true,
    },
    emergency_contact: {
        type: String,
        required: true,
        trim: true,
    },
    hotel_address: {
        type: String,
        required: false,
        trim: true,
    },
    nationltiy: {
        type: String,
        required: true,
        trim: true,
    },
    student_email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    isActive: {
        type: String,
        enum: ['Active', 'Suspended', 'Expired'],
        default: 'Active'
    },
    participation: {
        type: [String],
        default: []
    },
    documents: {
        type: [String],
        default: []
    },
    Paralympic: {
        type: Boolean,
        default: false
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
    timestamps: true,
    strict: false
});

module.exports = mongoose.model('Student', StudentSchema);

