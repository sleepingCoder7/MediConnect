const Service = require("../models/Service.model.js");

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json({services});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllServices };