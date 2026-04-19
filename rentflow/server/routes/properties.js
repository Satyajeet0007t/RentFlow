const express = require("express");
const router = express.Router();
const Property = require("../models/Property"); // Your Property.js model

// GET all properties from 'properties_list'
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find({});
    console.log("Sending to frontend:", properties[0]);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:name", async (req, res) => {
  try {
    const updated = await Property.findOneAndUpdate(
      { name: req.params.name },
      { $set: { tenants: req.body.tenants, vac: req.body.vac } },
      { returnDocument: "after", upsert: true }, // ADD UPSERT HERE
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const property = new Property({
    name: req.body.name,
    address: req.body.address,
    rent: req.body.rent,
    vac: req.body.vac, // <--- IMPORTANT
    bhk: req.body.bhk, // <--- IMPORTANT
    range: req.body.range, // <--- IMPORTANT
  });
  try {
    const newProperty = await property.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
