const mongoose = require("mongoose");

const ApartmentSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rooms: {
    type: String,
    required: true,
    enum: ["1BHK", "2BHK", "3BHK", "4BHK", "Studio"],
  },
  status: {
    type: String,
    default: "Available",
    enum: ["Available", "Rented"],
  },
  amenities: [String],
  images: [String],
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Apartment", ApartmentSchema);
