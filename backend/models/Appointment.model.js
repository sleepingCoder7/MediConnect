const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    comments: {
        type: String,
        required: false,
    },
    reports: [
        {
            url: String,
            public_id: String,
            format: String,
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);