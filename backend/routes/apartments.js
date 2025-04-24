const express = require("express");
const router = express.Router();
const Apartment = require("../models/apartments");

// Get all apartments
router.get("/", async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new apartment
router.post("/", async (req, res) => {
  const apartment = new Apartment(req.body);
  try {
    const newApartment = await apartment.save();
    res.status(201).json(newApartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update apartment
router.patch("/:id", async (req, res) => {
  try {
    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedApartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
