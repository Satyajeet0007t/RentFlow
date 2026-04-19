const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// 1. GET: Fetch all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST: Create a new booking
router.post("/", async (req, res) => {
  // CRITICAL FIX: Match these names to your Frontend payload exactly
  const { residentName, email, phone, bhkType, wing } = req.body;

  try {
    const newBooking = new Booking({
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      residentName,
      email,
      phone,
      wing: wing, // This matches the "wing" key in payload
      area: bhkType, // Maps bhkType to the "area" field in your Schema
      date: new Date().toLocaleDateString("en-GB"),
      slot: "Standard",
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
