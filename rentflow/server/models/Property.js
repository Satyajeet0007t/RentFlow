const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // "A", "B", etc.
  address: { type: String, default: "Luxury Residency, Pune" },
  rent: { type: Number, default: 0 },
  tenants: { type: Number, default: 0 },
  vac: { type: Number, default: 0 }, // THE CRITICAL FIELD
  bhk: { type: String, default: "1-2 BHK" },
  range: { type: String, default: "15K-20K" },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "unpaid"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Property", PropertySchema);
