require("dotenv").config(); // Load environment variables
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet"); // For securing HTTP headers
const morgan = require("morgan"); // For logging HTTP requests
const authRoutes = require("./routes/authRoutes/authRoutes");
const { verifyToken } = require("./middleware/authMiddleware");
const protectedRouter = require("./routes/protectedRoutes/protectedRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow dynamic CORS configuration
  credentials: true, // Allow cookies to be sent
};

// Security Headers Middleware using helmet
app.use(helmet());

// Logger Middleware (Logs HTTP requests)
app.use(morgan("combined"));

// CORS Middleware
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json({ limit: "50mb" }));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/protected", verifyToken, protectedRouter);

// Health Check Route (useful in production and for monitoring)
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Server is running smoothly." });
});

// Authentication Check Route
app.get("/api/check-auth", (req, res) => {
  const isAuthenticated = Boolean(req.cookies["token"]);
  res.json({ isAuthenticated });
});

// Serve Static Files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Catch-all Route for SPAs
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Error Handling Middleware (Centralized for consistency)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

// Database Connection (Sequelize)
const db = require("./models");

// Define the port to listen on
const PORT = process.env.PORT || 3000;

// Function to start the server with proper error handling
const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error syncing database:", err);
    process.exit(1); // Exit process if DB sync fails
  }
};

// Start the server
startServer();

// Graceful Shutdown (For production readiness)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  app.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server...");
  app.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });
});
