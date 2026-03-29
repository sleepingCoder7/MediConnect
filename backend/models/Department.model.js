const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
        default: "https://res.cloudinary.com/doplslfqq/image/upload/v1774677348/default-doctor_gavj2m.jpg",
    },
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);