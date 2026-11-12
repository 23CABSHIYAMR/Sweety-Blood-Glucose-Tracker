const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validations
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

    // Check if email already registered
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, name, email, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
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

    // Look up user
    const result = await db.query(
      'SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
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
  getMe
};
