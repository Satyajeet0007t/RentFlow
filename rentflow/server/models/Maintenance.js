const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Changed from 'name'
    title: { type: String, required: true },
    description: { type: String, required: true }, // Changed from 'issue'
    wing: String,
    flatNo: String,
    status: { type: String, default: "Open" },
    date: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
