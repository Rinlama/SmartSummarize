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


// Set up multer for file upload (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../public","uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);  // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);  // Use a unique filename
  },
});
// Configure multer to store files in file
const upload = multer({ storage: storage });


async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Process uploaded files
    const filesInfo = req.files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }));

          // Upload files to Gemini using their URLs
        const files = await Promise.all(
          filesInfo.map(async (file) => {
            console.log(`Uploading file: ${file}`);
            await uploadToGemini(file.url, {
              mimeType: file.mimeType,  
              displayName: path.basename(file.url),
            });
          })
      );

      // Prepare prompt parts with files' information
      const parts = files.flatMap((file, index) => [
        { text: `Image ${index + 1}:` },
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          },
        },
        { text: "List of Objects:" },
      ]);
  
      // Generate content using the uploaded files
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      });
  
      // Return the generated result
      res.json({ objects: result.response.text() });


  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
