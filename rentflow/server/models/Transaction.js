const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    billId: String, // Frontend uses item.billId
    wing: String, // Frontend uses item.wing
    flatNo: String,
    amount: Number, // Frontend uses item.amount
    date: String, // Frontend uses item.date
    status: { type: String, default: "Pending" },
    utrNumber: String,
    paidAt: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", TransactionSchema);
