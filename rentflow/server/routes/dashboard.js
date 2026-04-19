const express = require("express");
const router = express.Router();

// NOTE: Make sure these model names match your actual files in server/models/
const Property = require("../models/Property");
const Maintenance = require("../models/Maintenance");
const Booking = require("../models/Booking");
const Notice = require("../models/Notice");

// Route for Properties
router.get("/properties", async (req, res) => {
  try {
    const data = await Property.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for Maintenance
router.get("/maintenance", async (req, res) => {
  try {
    const data = await Maintenance.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for Bookings
router.get("/bookings", async (req, res) => {
  try {
    const data = await Booking.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for Notices
router.get("/notices", async (req, res) => {
  try {
    const data = await Notice.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
