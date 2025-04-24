const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  area: String,
  type: String,
  budget: Number,
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Confirmed", "Completed"],
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Confirmed', 'Rejected']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
  completedAt: Date,
});

module.exports = mongoose.model("Request", RequestSchema);
