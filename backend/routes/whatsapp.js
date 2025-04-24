const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const {
  processMessage,
  findMatchingApartments,
} = require("../services/messageProcessor");

// Middleware to preserve case sensitivity
router.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      req.rawBody = buf.toString();
    } catch (e) {
      console.error("Failed to parse raw body", e);
    }
  }
}));

// Helper function to send WhatsApp messages
const sendMessage = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    throw error;
  }
};

// Webhook for incoming WhatsApp messages
router.post("/incoming", async (req, res) => {
  try {
    // Parse the raw body to maintain case sensitivity
    const rawBody = JSON.parse(req.rawBody || '{}');
    const message = rawBody.Body || req.body.Body;
    const from = rawBody.From || req.body.From;

    if (!message || !from) {
      throw new Error("Missing Body or From in request");
    }

    console.log("Incoming message:", { message, from });

    // Process the message
    const processedData = await processMessage(message, from);

    // Handle filter commands ("show larger"/"show cheaper")
    if (processedData.isFilter) {
      const matches = await findMatchingApartments(from, { 
        [processedData.filterType]: true 
      });

      if (matches.length > 0) {
        let filterMessage = `Here are ${processedData.filterType} properties:\n\n`;
        matches.forEach((apt, index) => {
          filterMessage += `${index + 1}. ${apt.rooms} in ${apt.location} - EGP${apt.price}\n`;
        });
        await sendMessage(from, filterMessage);
      } else {
        await sendMessage(from, `No ${processedData.filterType} properties found.`);
      }
      
      return res.status(200).send("Filter processed");
    }

    // Handle error responses from processMessage
    if (processedData.error) {
      await sendMessage(from, processedData.error);
      return res.status(200).send("Error message sent");
    }

    // Handle "Yes" confirmation
    if (message.toLowerCase().trim() === 'yes') {
      const matches = await findMatchingApartments(from);
      
      if (matches.length > 0) {
        let matchesMessage = "Here are matching properties:\n\n";
        matches.forEach((apt, index) => {
          matchesMessage += `${index + 1}. ${apt.rooms} in ${apt.location} - EGP${apt.price}\n`;
        });
        await sendMessage(from, matchesMessage);
      } else {
        await sendMessage(from, "No matching properties found. Try different criteria.");
      }
    } 
    // Handle "No" rejection
    else if (message.toLowerCase().trim() === 'no') {
      await sendMessage(from, "Okay, let's start over. Please share your requirements (e.g., '2BHK in Maadi, budget 8000')");
    }
    // Handle new requests
    else {
      const confirmationMessage = `Thank you! I've noted:\n- Area: ${
        processedData.area || "Not specified"
      }\n- Type: ${processedData.type || "Not specified"}\n- Budget: ${
        processedData.budget || "Not specified"
      }\n\nIs this correct? (Yes/No)`;

      await sendMessage(from, confirmationMessage);
    }

    res.status(200).send("Message processed");
  } catch (error) {
    console.error("Error in /incoming:", error);
    
    try {
      await sendMessage(from, "Sorry, something went wrong. Please try again.");
    } catch (twilioError) {
      console.error("Failed to send error message:", twilioError);
    }
    
    res.status(500).send("Error processing message");
  }
});

// Endpoint to send matches (for external triggers)
router.post("/send-matches", async (req, res) => {
  try {
    const { clientId, filters = {} } = req.body;
    const matches = await findMatchingApartments(clientId, filters);

    let matchesMessage = "Here are matching properties:\n\n";
    matches.forEach((apt, index) => {
      matchesMessage += `${index + 1}. ${apt.rooms} in ${apt.location} - EGP${apt.price}\n`;
    });

    await sendMessage(`whatsapp:${clientId}`, 
      matches.length > 0 ? matchesMessage : "No matching properties found"
    );

    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("Error in /send-matches:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;