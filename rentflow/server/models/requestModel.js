const mongoose = require("mongoose");

const ResetRequestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ResetRequest", ResetRequestSchema);
