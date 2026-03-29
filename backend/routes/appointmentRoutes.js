const express = require("express");
const { getAppointments, createAppointment, deleteAppointment } = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authMiddleware, getAppointments);
router.post("/", authMiddleware, upload.array("reports"), createAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;
