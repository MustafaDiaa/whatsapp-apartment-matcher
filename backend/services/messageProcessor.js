const Request = require("../models/request");
const Apartment = require("../models/apartments");

// Extract parameters from message
function extractParameters(message) {
  const result = {
    area: null,
    type: null,
    budget: null,
  };

  // Extract area (look for "in <location>" pattern)
  const areaMatch = message.match(/in\s+([a-zA-Z]+)|near\s+([a-zA-Z]+)/i);
  if (areaMatch) {
    result.area = areaMatch[1] || areaMatch[2];
  }

  // Extract type (look for XBHK pattern)
  const typeMatch = message.match(/\d+BHK|studio/i);
  if (typeMatch) {
    result.type = typeMatch[0].toUpperCase();
  }

  // Extract budget (look for numbers after "budget" or "EGP")
  const budgetMatch = message.match(/budget\s+(\d+)|EGP\s*(\d+)/i);
  if (budgetMatch) {
    result.budget = parseInt(budgetMatch[1] || budgetMatch[2]);
  }

  return result;
}

// Process incoming message
async function processMessage(message, clientId) {
  const normalizedMessage = message.toLowerCase().trim();

  // 1. Handle filter commands
  if (normalizedMessage === 'show larger' || normalizedMessage === 'show cheaper') {
    const lastRequest = await Request.findOne({
      clientId,
      status: 'Confirmed'
    }).sort({ createdAt: -1 });

    if (!lastRequest) {
      return { 
        error: "No confirmed request found. Please start a new search first."
      };
    }

    return {
      isFilter: true,
      filterType: normalizedMessage.replace('show ', ''),
      originalRequest: lastRequest
    };
  }

  // 2. Handle Yes/No responses
  if (normalizedMessage === 'yes' || normalizedMessage === 'no') {
    const lastRequest = await Request.findOne({ 
      clientId, 
      status: 'Pending'
    }).sort({ createdAt: -1 });

    if (!lastRequest) {
      return { area: null, type: null, budget: null };
    }

    if (normalizedMessage === 'yes') {
      await Request.findByIdAndUpdate(lastRequest._id, { status: 'Confirmed' });
      return {
        area: lastRequest.area,
        type: lastRequest.type,
        budget: lastRequest.budget
      };
    } else {
      await Request.findByIdAndDelete(lastRequest._id);
      return { area: null, type: null, budget: null };
    }
  }

  // 3. Handle new requests
  const params = extractParameters(message);
  
  const request = new Request({
    clientId,
    area: params.area,
    type: params.type,
    budget: params.budget,
    status: 'Pending'
  });
  
  await request.save();
  
  return params;
}

// Find matching apartments
async function findMatchingApartments(clientId, filters = {}) {
  // Get the most recent confirmed request
  const request = await Request.findOne({ 
    clientId, 
    status: 'Confirmed' 
  }).sort({ createdAt: -1 });

  if (!request) {
    throw new Error('No confirmed request found');
  }

  // Build query based on request
  const query = {
    status: 'Available'
  };

  if (request.area) {
    query.location = new RegExp(request.area, 'i');
  }

  if (request.type) {
    query.rooms = request.type;
  }

  if (request.budget) {
    query.price = { $lte: request.budget };
  }

  // Apply additional filters
  if (filters.cheaper) {
    query.price.$lte = request.budget * 0.9; // 10% cheaper
  }

  if (filters.larger) {
    const roomOrder = ['1BHK', '2BHK', '3BHK', '4BHK', 'Studio'];
    const currentIndex = roomOrder.indexOf(request.type);
    if (currentIndex !== -1 && currentIndex < roomOrder.length - 1) {
      query.rooms = { $in: roomOrder.slice(currentIndex + 1) };
    }
  }

  // Find matching apartments
  return await Apartment.find(query).limit(5);
}

module.exports = {
  processMessage,
  findMatchingApartments,
  extractParameters
};