const jwt = require('jsonwebtoken'); // Importing the JWT library for token operations

// Middleware function for authentication
function auth(req, res, next) {
  const token = req.header('Authorization').split(' ')[1]; // Extracting the token from the Authorization header

  // Check if a token exists in the request header
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT_SECRET and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign the entire decoded object to req.user for further use in routes
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (e) {
    // If the token is invalid or expired, send an error response
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth; // Exporting the auth middleware for use in routes
