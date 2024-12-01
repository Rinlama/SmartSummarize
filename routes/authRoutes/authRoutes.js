const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require('../../models');
const JWT_SECRET = process.env.JWT_SECRET;


// POST /login - Verify Google Token and login or create user
router.post('/login', async (req, res) => {
  const { token } = req.body;  // Expecting the Google ID token from the client-side

  if (!token) {
    return res.status(400).send('Google ID token is required');
  }

  try {
    // Function to validate the token
    const validateToken = async (token) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
        );
        const data = await response.json();

        if (data.error === 'invalid_token') {
          // Token is invalid, handle the invalid case
          return { valid: false, message: 'Invalid token' };
        }

        // Return user information if token is valid
        return { valid: true, data };
      } catch (error) {
        console.error('Error validating token:', error);
        return { valid: false, message: 'Error verifying token' };
      }
    };

    // Validate the token
    const validationResponse = await validateToken(token);
    if (!validationResponse.valid) {
      return res.status(401).json({ message: validationResponse.message });
    }

    // Extract the payload from the validated token
    const { data } = validationResponse;
    const googleId = data.user_id; // This is the Google ID you use to identify the user

    // Check if the user already exists in the database
    let user = await User.findOne({ where: { googleId } });

    if (user) {
      // If user exists, return login success
      return res.status(200).json({
        message: 'Login successful',
        userId: user.id,
        name: user.name,
      });
    } else {
      // If user does not exist, create a new user
      user = await User.create({
        googleId,
        name: data.name || 'Unknown',  // Use the name from the token data
      });

      return res.status(201).json({
        message: 'User created successfully',
        userId: user.id,
        username: user.username,
      });
    }
  } catch (error) {
    console.error('Error during login process:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Route to login
router.post("/logout", (req, res) => {
  const { username, password } = req.body;
  // Clear the authentication cookie
  res.clearCookie("token", { path: "/" }); // Adjust path and domain if needed
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
