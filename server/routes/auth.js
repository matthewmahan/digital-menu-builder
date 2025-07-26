const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, first_name } = req.body;
    const db = getDatabase();

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const sql = `
        INSERT INTO users (email, password_hash, first_name, is_first_login, subscription_tier)
        VALUES (?, ?, ?, 1, 'Free')
      `;

      db.run(sql, [email, passwordHash, first_name], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        const userId = this.lastID;
        const token = generateToken({
          id: userId,
          email,
          first_name,
          company_id: null,
          subscription_tier: 'Free'
        });

        res.status(201).json({
          message: 'User created successfully',
          user: {
            id: userId,
            email,
            first_name,
            is_first_login: true,
            subscription_tier: 'Free'
          },
          token
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;
    const db = getDatabase();

    // Find user by email
    const sql = `
      SELECT u.*, c.id as company_id, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = ?
    `;

    db.get(sql, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        company_id: user.company_id,
        subscription_tier: user.subscription_tier
      });

      // Update last login
      db.run('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          company_id: user.company_id,
          company_name: user.company_name,
          is_first_login: user.is_first_login,
          subscription_tier: user.subscription_tier
        },
        token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;

  const sql = `
    SELECT u.*, c.id as company_id, c.name as company_name
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.id = ?
  `;

  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        company_id: user.company_id,
        company_name: user.company_name,
        is_first_login: user.is_first_login,
        subscription_tier: user.subscription_tier
      }
    });
  });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router; 