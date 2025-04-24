const express = require("express");
const router = express.Router();
const Request = require("../models/request");

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { status, area, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (area) filter.area = new RegExp(area, 'i');
    if (type) filter.type = type;

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log({status})
    if (!['Pending', 'Confirmed', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
