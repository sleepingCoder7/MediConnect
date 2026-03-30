const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function() {
                return this.provider === "local";
            },
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        profilePic: {
            type: String,
            default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        },
        profile: {
            firstName: String,
            lastName: String,
            phone: { type: Number },
            gender: { type: String, enum: ["Male", "Female"] },
            dateOfBirth: Date,
        },
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            zipcode: String,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
