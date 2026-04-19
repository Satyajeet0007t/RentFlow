const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");

// 1. GET: Fetch all tickets
router.get("/", async (req, res) => {
  try {
    const data = await Maintenance.find().sort({ createdAt: -1 }); // Newest tickets first
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST: Create a new ticket
router.post("/", async (req, res) => {
  try {
    const { type, title, description, wing, flatNo } = req.body;

    const newItem = new Maintenance({
      type: type, // Fixed: was 'name'
      title: title, // Fixed: added
      description: description, // Fixed: was 'issue'
      wing: wing,
      flatNo: flatNo ? flatNo.toString().toUpperCase().trim() : "N/A",
      status: "Open",
      date: new Date().toLocaleDateString("en-IN"),
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. PATCH: Resolve a ticket
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status: "Done" },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE: Remove a ticket
router.delete("/:id", async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
