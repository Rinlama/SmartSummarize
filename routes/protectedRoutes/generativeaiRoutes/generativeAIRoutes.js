const express = require("express");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Initialize Google Generative AI and File Manager
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Set up multer storage (using memory storage to store file in buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Handle multiple file uploads

// Converts base64 data to a GoogleGenerativeAI.Part object
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };
}
// Define the AI model and generation config
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Protected route to process files and generate content
router.post("/process-files", upload.array("files"),async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Convert the uploaded files to base64 format
    const fileParts = req.files.map(function (file) {
      const base64Data = file.buffer.toString('base64'); // Convert file buffer to base64
      return base64ToGenerativePart(base64Data, file.mimetype); // Create generative part for each file
    });

    // Choose the Gemini model for content generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Define the prompt for content generation
    const prompt = "Summarize the uploaded files.";

    // Generate content based on the model and the prompt along with the uploaded files
    const generatedContent = await model.generateContent([prompt].concat(fileParts));

    // Send back the generated response
    return res.json({
      response: generatedContent.response.text(),
    });

  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/generate-content-stream", async (req, res) => {
  try {
    // Get the prompt from the request body
    const { prompt,history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Set appropriate headers for streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const chat = model.startChat({
      history: history || [], // Use provided history or initialize an empty one
    });

    // Generate content stream
    const result = await chat.sendMessageStream(prompt);

    // Stream the content back to the client
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); // Send each chunk to the client
    }

    // End the stream after all chunks are sent
    res.end();

  } catch (error) {
    console.error("Error generating content stream:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;