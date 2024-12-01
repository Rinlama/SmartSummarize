const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);  // Set your Google OAuth Client ID in .env

// Function to verify the Google token
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the client ID to check the token's validity
    });
    const payload = ticket.getPayload();
    return payload;  // Return the user payload if valid
  } catch (error) {
    throw new Error('Invalid Google ID token');
  }
}

module.exports = { verifyGoogleToken };
