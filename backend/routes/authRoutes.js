const express = require("express");
const { registerUser, loginUser, logoutUser, getMe, googleLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);
router.post("/google", googleLogin);

module.exports = router;