// routes/protected.js
const express = require("express");
const router = express.Router();

const generativeAIRouter = require("./generativeaiRoutes/generativeAIRoutes"); // Adjust path if necessary

// Define the /highlight route under /protected
router.use("/generativeai", generativeAIRouter);

module.exports = router;
