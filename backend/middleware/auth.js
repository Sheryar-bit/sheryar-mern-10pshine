const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../config/logger');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Bearer ')) {
    logger.warn({ path: req.path, method: req.method }, 'Unauthorized access attempt: No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = auth.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.getUserById(decoded.id);
    
    if (!user) {
      logger.warn({ userId: decoded.id, path: req.path }, 'Unauthorized access: User not found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    logger.debug({ userId: user.id, email: user.email, path: req.path }, 'User authenticated successfully');
    next();
  } catch (err) {
    logger.error({ err, path: req.path, method: req.method }, 'Authentication failed: Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
