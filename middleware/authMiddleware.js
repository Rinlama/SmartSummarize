const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
  // Check if the token is present in the Authorization header
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // If valid, attach the decoded data (user information) to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { verifyToken };
