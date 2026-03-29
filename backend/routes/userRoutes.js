const express = require("express");
const { updateUser, uploadProfilePic } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put("/update", authMiddleware, updateUser);
router.post("/upload-profile-pic", authMiddleware, upload.single("profilePic"), uploadProfilePic);

module.exports = router;
