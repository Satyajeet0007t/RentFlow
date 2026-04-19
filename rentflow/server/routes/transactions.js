const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction"); // Ensure path to model is correct

// 1. GET ALL (Hits: GET /api/transactions)
router.get("/", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ _id: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GENERATE BILL (Hits: POST /api/transactions)
router.post("/", async (req, res) => {
  try {
    const { wing, flatNo, amount } = req.body;

    const newTx = new Transaction({
      ...req.body,
      // FIX: This ensures "a" becomes "A" and " 302 " becomes "302"
      wing: wing.toString().trim().toUpperCase(),
      flatNo: flatNo.toString().trim().toUpperCase(),
      status: "Pending",
    });

    await newTx.save();
    res.status(201).json(newTx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. REVERT PAYMENT (Hits: PATCH /api/transactions/revert/:id)
// IMPORTANT: This MUST be defined before the general "/:id" route
router.patch("/revert/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: "Pending",
        utrNumber: "",
        paidAt: null,
      },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. MARK PAID / GENERAL UPDATE (Hits: PATCH /api/transactions/:id)
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: "Paid",
        // Check if frontend sends 'utr' or 'utrNumber'
        utrNumber: req.body.utr || req.body.utrNumber,
        paidAt: req.body.paidAt,
      },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. DELETE (Hits: DELETE /api/transactions/:id)
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
