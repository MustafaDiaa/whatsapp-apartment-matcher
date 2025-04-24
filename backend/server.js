require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const whatsappRoutes = require("./routes/whatsapp.js");
const apartmentRoutes = require("./routes/apartments.js");
const requestRoutes = require("./routes/requests.js");

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/requests", requestRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
