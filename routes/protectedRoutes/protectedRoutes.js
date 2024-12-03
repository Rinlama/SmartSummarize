// routes/protected.js
const express = require("express");
const router = express.Router();

const generativeAIRouter = require("./generativeaiRoutes/generativeAIRoutes"); // Adjust path if necessary
const userRouter = require("./userRoutes/userRoutes"); // Adjust path if necessary

// Define the /highlight route under /protected
router.use("/generativeai", generativeAIRouter);

// Define the /user route under /protected
router.use("/user", userRouter);

module.exports = router;
