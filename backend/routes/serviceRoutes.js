const express = require("express");
const { getAllServices } = require("../controllers/serviceController.js");

const router = express.Router();

router.get("/", getAllServices);

module.exports = router;