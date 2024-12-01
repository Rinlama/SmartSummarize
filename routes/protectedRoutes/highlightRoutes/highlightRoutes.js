const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create an Express Router instance
const router = express.Router();

// Converts base64 data to a GoogleGenerativeAI.Part object
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };
}

router.post('/process-files', async function (req, res) {
  try {
    // Check if files were uploaded
    const { files } = req.body; // The request body should contain an array of base64-encoded file data


    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided in the request." });
    }

    // Convert each base64 string into a Generative Part object
    const fileParts = files.map(function (file) {
      const { base64Data, mimeType } = file; // Assume file has `base64Data` and `mimeType`
      return base64ToGenerativePart(base64Data, mimeType); // Create generative part for each file
    });
    // Choose the Gemini model for content generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Define the prompt for content generation
    const prompt = "Summarize the uploaded files.";

    return  res.json({
      response: fileParts,
    });

    // Generate content based on the model and the prompt along with the uploaded files
    const generatedContent = await model.generateContent([prompt].concat(fileParts));

    // Send back the generated response
    return res.json({
      response: generatedContent.response.text(),
    });
  } catch (error) {
    console.error("Error during file processing:", error);
    return res.status(500).json({ error: "An error occurred while processing the files." });
  }
});

module.exports = router;
