const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../../middleware/authMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate Access Token (short-lived, e.g. 15m)
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate Refresh Token (long-lived, e.g. 7d)
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Store or update refresh token in DB
 */
async function saveRefreshToken(userId, token) {
  // 7 days from now
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, token, expiresAt]
  );
}

const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE_OPTIONS,
  maxAge: 15 * 60 * 1000 // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function setAuthCookies(res, accessToken, refreshToken) {
  if (accessToken) {
    res.cookie('sweety_access_token', accessToken, ACCESS_COOKIE_OPTIONS);
  }
  if (refreshToken) {
    res.cookie('sweety_refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
  }
}

function clearAuthCookies(res) {
  res.clearCookie('sweety_access_token', COOKIE_BASE_OPTIONS);
  res.clearCookie('sweety_refresh_token', COOKIE_BASE_OPTIONS);
}

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, name, email, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const newUser = result.rows[0];
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await saveRefreshToken(newUser.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      token: accessToken, // backward compatibility
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log in an existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await db.query(
      'SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      token: accessToken, // backward compatibility
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh access token using valid refresh token
 */
async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.sweety_refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    // Check token in DB
    const tokenRecord = await db.query(
      'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (tokenRecord.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or revoked refresh token. Please log in again.' });
    }

    // Check expiration in DB
    if (new Date(tokenRecord.rows[0].expires_at) < new Date()) {
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.rows[0].id]);
      return res.status(401).json({ error: 'Refresh token has expired. Please log in again.' });
    }

    // Verify JWT cryptographic signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    // Lookup user to populate access token payload
    const userRes = await db.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];

    // Token rotation: delete old refresh token and issue a fresh pair
    await db.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.rows[0].id]);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await saveRefreshToken(user.id, newRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout and revoke refresh token
 */
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.sweety_refresh_token || req.body?.refreshToken;
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user profile
 */
async function getMe(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe
};
