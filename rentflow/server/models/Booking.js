const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  residentName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // Strict 10-digit check
  },
  wing: { type: String, required: true },
  area: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, default: "Standard" },
  status: { type: String, default: "Waiting" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
