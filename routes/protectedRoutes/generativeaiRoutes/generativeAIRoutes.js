const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const { User } = require("../../../models");

const router = express.Router();

// Set up multer storage (using memory storage to store file in buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Handle multiple file uploads

// Converts base64 data to a GoogleGenerativeAI.Part object
const base64ToGenerativePart = (base64Data, mimeType) => ({
  inlineData: {
    data: base64Data,
    mimeType,
  },
});

// Utility function to fetch Gemini API key for a user
const getGeminikey = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["geminiApiKey"],
  });
  return user ? user.geminiApiKey : null; // Return null if user not found
};

// Define the AI model generation configuration
const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Helper function to handle the generation and response logic
const generateContent = async (userId, fileParts, prompt) => {
  const geminikey = await getGeminikey(userId);
  if (!geminikey) {
    throw new Error("User not found or geminikey missing");
  }

  const genAI = new GoogleGenerativeAI(geminikey);

  // Choose the Gemini model for content generation
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
  });

  // Generate content based on files and prompt
  const generatedContent = await model.generateContent([prompt, ...fileParts]);

  return generatedContent.response.text();
};

// Protected route to process files and generate content
router.post("/process-files", upload.array("files"), async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Convert the uploaded files to base64 format
    const fileParts = req.files.map((file) => {
      const base64Data = file.buffer.toString("base64");
      return base64ToGenerativePart(base64Data, file.mimetype);
    });

    const userId = req.user.userId;
    const prompt = "Summarize the uploaded files."; // The prompt for the AI model

    // Generate content based on the files and prompt
    const generatedContent = await generateContent(userId, fileParts, prompt);

    // Return the generated content to the client
    return res.json({
      response: generatedContent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Route to generate content with streaming response
router.post("/generate-content-stream", async (req, res) => {
  try {
    // Get the prompt and history from the request body
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Set appropriate headers for streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const userId = req.user.userId;
    const geminikey = await getGeminikey(userId);
    if (!geminikey) {
      return res
        .status(404)
        .json({ error: "User not found or geminikey missing" });
    }

    const genAI = new GoogleGenerativeAI(geminikey);

    // Choose the Gemini model for content generation
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
    });

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
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
