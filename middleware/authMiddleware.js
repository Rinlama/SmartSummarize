const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  // const token = req.cookies.token;
  // if (token == null) return res.sendStatus(401);

  // jwt.verify(token, JWT_SECRET, (err, user) => {
  //   if (err) return res.sendStatus(403);
  //   req.user = user;
  //   next();
  // });

  next();
}

module.exports = { authenticateToken };
