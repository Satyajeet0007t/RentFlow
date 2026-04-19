const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  wing: { type: String, required: true }, // New Field
  flatNo: { type: String, required: true }, // New Field
  role: { type: String, enum: ["resident", "manager"], default: "resident" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Login", LoginSchema);
