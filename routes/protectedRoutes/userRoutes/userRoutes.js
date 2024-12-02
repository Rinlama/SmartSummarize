const express = require("express");
const router = express.Router();
const { User } = require("../../../models");

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });

    if (user) {
      return res.status(200).json(user);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// POST /update - Update user information
router.put("/update", async (req, res) => {
  try {
    const { googleId, geminiApiKey } = req.body; // Expecting the Google ID token and Gemini API key from the client-side

    if (!googleId) {
      return res.status(400).json({ message: "Google ID is required" });
    }

    // Check if the user already exists in the database
    let user = await User.findOne({ where: { googleId } });

    if (user) {
      // Update the user's Gemini API key only if it's provided
      if (geminiApiKey) {
        await user.update({ geminiApiKey });
      }

      return res.status(200).json({
        message: "User update successful",
        geminiApiKey: geminiApiKey || user.geminiApiKey, // Send the updated or existing value
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
