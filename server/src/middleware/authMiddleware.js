const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'sweety_jwt_secret_token_change_in_production_123456';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_ACCESS_SECRET}_refresh_key`;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const cookieToken = req.cookies && (req.cookies.sweety_access_token || req.cookies.token || req.cookies.accessToken);
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Your session has expired.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ error: 'Invalid or expired access token.' });
    }

    req.user = decoded; // { id, email, name }
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET
};
