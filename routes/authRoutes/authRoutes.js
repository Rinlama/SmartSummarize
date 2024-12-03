const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { JWT_SECRET_KEY } = process.env;

// Utility function to fetch user info from Google
const fetchUserInfo = async (token) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw new Error("Error fetching user info");
  }
};

// Function to validate Google token
const validateToken = async (token) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    const data = await response.json();

    if (data.error === "invalid_token") {
      return { valid: false, message: "Invalid token" };
    }

    return { valid: true, data };
  } catch (error) {
    console.error("Error validating token:", error);
    return { valid: false, message: "Error verifying token" };
  }
};

// Function to generate JWT token for session
const generateSessionToken = (userId, googleId) => {
  return jwt.sign({ userId, googleId }, JWT_SECRET_KEY, {
    expiresIn: "1h", // Adjust expiration as needed
  });
};

// Function to handle the login logic
const handleLogin = async (token) => {
  const validationResponse = await validateToken(token);

  if (!validationResponse.valid) {
    throw new Error(validationResponse.message);
  }

  const userData = await fetchUserInfo(token);

  if (!userData || !userData.id) {
    throw new Error("Invalid token or user info not found");
  }

  const googleId = validationResponse.data.user_id;
  const { email, name, picture } = userData;

  // Check if the user exists in the database
  let user = await User.findOne({ where: { googleId } });

  if (user) {
    // If user exists, update their information
    await user.update({ name, picture });

    // Generate session token
    const ssToken = generateSessionToken(user.id, googleId);

    return { user, ssToken, message: "Login successful" };
  } else {
    // If user does not exist, create a new one
    user = await User.create({ googleId, name, email, picture });

    // Generate session token
    const ssToken = generateSessionToken(user.id, googleId);

    return { user, ssToken, message: "User created successfully" };
  }
};

// POST /login - Verify Google Token and login or create user
router.post("/login", async (req, res) => {
  const { token } = req.body; // Expecting the Google ID token from the client-side

  if (!token) {
    return res.status(400).send("Google ID token is required");
  }

  try {
    const { user, ssToken, message } = await handleLogin(token);

    return res.status(user ? 200 : 201).json({
      message,
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      googleId: user.googleId,
      ssToken,
    });
  } catch (error) {
    console.error("Error during login process:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

// POST /logout - Clear authentication cookie
router.post("/logout", (req, res) => {
  // Clear the authentication cookie
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
