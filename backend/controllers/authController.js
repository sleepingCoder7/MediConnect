const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const firstName = name.split(" ")[0];
        const lastName = name.split(" ")[name.split(" ").length - 1];

        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword, profile: { firstName, lastName } });
        res.status(201).json({ id: user._id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 3600000
        });

        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, profile: user.profile, address: user.address, profilePic: user.profilePic } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMe = async (req, res) => {
    let user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, profile: user.profile, address: user.address, profilePic: user.profilePic } });
}

const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, gender, dateOfBirth, email, phone, line1, line2, city, state, zipcode } = req.body;

        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        user.profile.firstName = firstName;
        user.profile.lastName = lastName;
        user.profile.gender = gender;
        user.profile.dateOfBirth = dateOfBirth;
        user.name = firstName + " " + lastName;
        user.email = email;
        user.profile.phone = phone;
        user.address.line1 = line1;
        user.address.line2 = line2;
        user.address.city = city;
        user.address.state = state;
        user.address.zipcode = zipcode;

        await user.save();
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, profile: user.profile, address: user.address, profilePic: user.profilePic } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const uploadProfilePictoCloudinary = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "profile_pics",
                resource_type: "image",
                public_id: fileName.split(".")[0] + "_" + Date.now(),
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if(error){
                    reject(error);
                }else{
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
}

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadProfilePictoCloudinary(req.file.buffer, req.file.originalname);
        await Promise.resolve(result);
        
        const user = await User.findById(req.user.id);
        user.profilePic = result.secure_url;
        await user.save();
        
        res.status(200).json({ 
            message: "Profile picture uploaded successfully", 
            user: { 
                id: user._id, name: user.name, email: user.email,
                profile: user.profile, address: user.address, profilePic: user.profilePic 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { registerUser, loginUser, logoutUser, getMe ,updateUser, uploadProfilePic};