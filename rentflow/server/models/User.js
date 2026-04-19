const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["manager", "tenant"], default: "tenant" },
    wing: { type: String },
    unitNumber: { type: String },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
