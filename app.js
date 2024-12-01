require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes/authRoutes"); // Adjust path if necessary
const { authenticateToken } = require("./middleware/authMiddleware"); // Adjust path if necessary

const protectedRouter = require("./routes/protectedRoutes/protectedRoutes"); // Adjust path if necessary

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your front-end URL
    credentials: true,
  }),
);

// Middleware to parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Middleware to parse cookies
app.use(cookieParser());

// Use the authentication routes
app.use("/api/auth", authRoutes);

// Example of a protected route
app.use("/api/protected", authenticateToken, protectedRouter);

app.get("/api/check-auth", (req, res) => {
  if (req.cookies["token"]) {
    // Validate token
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});
// Serve static files from the 'client/dist' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle all other routes by serving the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// sequelize
const db = require("./models");
// Define the port to listen on
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    console.log("App is running on port " + PORT);
  });  
});

