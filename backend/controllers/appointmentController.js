const Appointment = require("../models/Appointment.model.js");
const fs = require("fs");
const cloudinary = require("../config/cloudinary.js");

const getAppointments = async (req, res) => {
    try {
        const { year } = req.query;
        const userId = req.user.id;

        let filter = { userId };

        if(year){
            const yearNum = parseInt(year);
            filter.appointmentDate = {
                $gte: new Date(`${yearNum}-01-01`),
                $lt: new Date(`${yearNum + 1}-01-01`),
            };
        }

        const appointments = await Appointment.find(filter).populate("departmentId", "name image").sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadFilesToCloudinary = async (files) => {
    try{
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer,file.originalname));
        const results = await Promise.all(uploadPromises);
        
        const fileUrls = results.map(result => ({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
        }));

        return fileUrls;
    }catch(error){
        throw error;
    }
}

const uploadToCloudinary = (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "reports",
                resource_type: "auto",
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

const createAppointment = async (req, res) => {
    try {
        const { departmentId, date, phone, comments } = req.body;
        const userId = req.user.id;

        let uploadedReports = [];
        if(req.files && req.files.length > 0){
            uploadedReports = await uploadFilesToCloudinary(req.files);
        }

        const appointment = new Appointment({
            userId,
            departmentId,
            appointmentDate: date,
            phone,
            comments,
            reports: uploadedReports
        });

        await appointment.save();
        res.status(201).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.id;

        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "User not authorized to delete this appointment" });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        if(appointment.reports.length > 0){
            deleteReportsFromCloudinary(appointment.reports);
        }
        
        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function deleteReportsFromCloudinary(reports){
    try{
        const deletePromises = reports.map(report => deleteFromCloudinary(report.public_id));
        await Promise.all(deletePromises);
    }catch(error){
        throw error;
    }
}

async function deleteFromCloudinary(publicId){
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if(error){
                reject(error);
            }else{
                resolve(result);
            }
        });
    });
}

module.exports = {
    getAppointments,
    createAppointment,
    deleteAppointment,
};