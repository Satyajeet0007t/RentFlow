const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice"); // Your schema file

// GET all notices
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    console.log("Database fetch count:", notices.length);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new notice
router.post("/", async (req, res) => {
  const { title, content, category, wing, date } = req.body;
  const notice = new Notice({ title, content, category, wing, date });

  try {
    const newNotice = await notice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a notice
router.delete("/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
