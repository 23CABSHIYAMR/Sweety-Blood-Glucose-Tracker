const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sweety_jwt_secret_token_change_in_production_123456';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    req.user = decoded; // { id, email, name }
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};

