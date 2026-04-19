const express = require("express");
const router = express.Router();

// Import all your models
const Property = require("../models/Property");
const Maintenance = require("../models/Maintenance");
const Booking = require("../models/Booking");
const Notice = require("../models/Notice");
const Transaction = require("../models/Transaction"); // Add Transaction model

// 1. SEARCH ROUTE (The "Resident Portal" Engine)
// Hits: GET /api/profile/search?wing=A&flat=101
router.get("/search", async (req, res) => {
  try {
    const { wing, flat } = req.query;

    if (!wing || !flat) {
      return res.status(400).json({ message: "Wing and Flat number required" });
    }

    // Clean the search keys
    const searchFlat = flat.toString().toUpperCase().trim();
    const searchWing = wing.toString().toUpperCase().trim();

    // Fetch only what belongs to this resident
    const [myPayments, myMaintenance] = await Promise.all([
      Transaction.find({ flatNo: searchFlat, wing: searchWing }),
      Maintenance.find({ flatNo: searchFlat, wing: searchWing }),
    ]);

    res.json({
      payments: myPayments,
      maintenance: myMaintenance,
      found: myPayments.length > 0 || myMaintenance.length > 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Search Error", error: err.message });
  }
});

// 2. GET ALL DASHBOARD DATA (For Admin Overview)
router.get("/all-stats", async (req, res) => {
  try {
    const [properties, maintenance, transactions] = await Promise.all([
      Property.find(),
      Maintenance.find(),
      Transaction.find(), // <--- THIS MUST BE HERE
    ]);
    // Send it all back
    res.json({ properties, maintenance, transactions });
  } catch (err) {
    res.status(500).json({ message: "Sync Error" });
  }
});

// Admin Reset Route
router.patch("/admin/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
    });

    res.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

module.exports = router;
