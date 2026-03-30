const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", uptime: process.uptime(), timestamp: Date.now() });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});