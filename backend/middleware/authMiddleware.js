const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        verifyOrigin(req);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.message === "Blocked by CSRF Protection(Invalid Origin)") {
            return res.status(403).json({ message: error.message });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
}

const allowedOrigins = [process.env.FRONTEND_URL];

const verifyOrigin = (req) => {
    const origin = req.headers.origin;
    //Allow Postman requests. Requests from postman does not have origin header.
    if(!origin){
        return;
    }
    if(!allowedOrigins.includes(origin)){
        throw new Error("Blocked by CSRF Protection(Invalid Origin)");
    }
}

module.exports = authMiddleware;