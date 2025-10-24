const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    if (!fullName || !email || !password) {
      logger.warn({ email }, 'Registration attempt with missing fields');
      return res.status(400).json({ error: 'Missing fields' });
    }

    const existing = await User.getUserByEmail(email);
    if (existing) {
      logger.warn({ email }, 'Registration attempt with existing email');
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await User.createUser(fullName, email, hash, role || 'User');
    
    logger.info({ userId: result.insertId, email, role: role || 'User' }, 'User registered successfully');
    res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (err) {
    logger.error({ err, email: req.body.email }, 'Registration failed');
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      logger.warn({ email }, 'Login attempt with missing fields');
      return res.status(400).json({ error: 'Missing fields' });
    }

    const user = await User.getUserByEmail(email);
    if (!user) {
      logger.warn({ email }, 'Login attempt with non-existent email');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.warn({ email, userId: user.id }, 'Login attempt with incorrect password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    logger.info({ userId: user.id, email, role: user.role }, 'User logged in successfully');
    res.json({ message: 'Logged in', token });
  } catch (err) {
    logger.error({ err, email: req.body.email }, 'Login failed');
    res.status(500).json({ error: 'Server error' });
  }
};
