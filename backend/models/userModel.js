const db = require('../db');
const logger = require('../config/logger');

async function createUser(fullName, email, passwordHash, role = 'User') {
  const sql = 'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(sql, [fullName, email, passwordHash, role], (err, result) => {
      if (err) {
        logger.error({ err, email }, 'Database error: Failed to create user');
        return reject(err);
      }
      logger.debug({ userId: result.insertId, email }, 'User record created in database');
      resolve(result);
    });
  });
}

async function getUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(sql, [email], (err, results) => {
      if (err) {
        logger.error({ err, email }, 'Database error: Failed to get user by email');
        return reject(err);
      }
      logger.debug({ email, found: !!results[0] }, 'User lookup by email completed');
      resolve(results[0]);
    });
  });
}

async function getUserById(id) {
  const sql = 'SELECT id, fullName, email, role FROM users WHERE id = ? LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(sql, [id], (err, results) => {
      if (err) {
        logger.error({ err, userId: id }, 'Database error: Failed to get user by ID');
        return reject(err);
      }
      logger.debug({ userId: id, found: !!results[0] }, 'User lookup by ID completed');
      resolve(results[0]);
    });
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
