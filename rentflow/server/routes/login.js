const express = require("express");
const router = express.Router();
const LoginModel = require("../models/Login");
const ResetRequest = require("../models/ResetRequest");
const bcrypt = require("bcryptjs");

const MASTER_EMAIL = "admin@mrsmartchoice.com";

router.post("/signup", async (req, res) => {
  try {
    // FIX 1: Extract 'wing' from the request body
    const { email, password, wing, flatNo } = req.body;

    let existingUser = await LoginModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }

    const assignedRole =
      email.toLowerCase() === MASTER_EMAIL.toLowerCase()
        ? "manager"
        : "resident";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // FIX 2: Add 'wing' to the new user object
    const newUser = new LoginModel({
      email,
      password: hashedPassword,
      wing: wing ? wing.toUpperCase() : "HQ",

      flatNo: flatNo ? flatNo.toString().toUpperCase() : "",
      role: assignedRole,
    });

    await newUser.save();
    res
      .status(201)
      .json({ success: true, msg: "Account created successfully." });
  } catch (err) {
    console.error("Signup Error:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server Error during registration" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await LoginModel.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Credentials" });

    res.json({
      success: true,
      role: user.role,
      wing: user.wing, // Added this
      flatNo: user.flatNo,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server Error during login" });
  }
});

router.patch("/admin-force-reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await LoginModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashedPassword },
      { new: true }, // Returns the updated document
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, msg: "Resident email not found." });
    }

    res.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    console.error("Server Reset Error:", err);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

router.post("/forgot-password-request", async (req, res) => {
  try {
    const { email } = req.body;

    // Create a new request in your database
    const newRequest = new ResetRequest({
      email: email.toLowerCase().trim(),
      status: "pending",
    });

    await newRequest.save();
    res.json({ success: true, msg: "Request sent to Manager" });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});

router.get("/reset-requests", async (req, res) => {
  try {
    const requests = await ResetRequest.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch requests" });
  }
});

router.put("/mark-done/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRequest = await ResetRequest.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true },
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, msg: "Request not found" });
    }

    res.json({ success: true, msg: "Request marked as done" });
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;
