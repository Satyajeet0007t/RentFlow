const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    // ADD THIS FIELD
    wing: { type: String, default: "All Wings" },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short", // Change to short for better card fit
          year: "numeric",
        }),
    },
  },
  { timestamps: true },
); // Add timestamps so .sort({createdAt: -1}) works

module.exports = mongoose.model("Notice", NoticeSchema);
