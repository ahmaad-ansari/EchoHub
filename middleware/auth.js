const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assign the entire decoded object to req.user
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
