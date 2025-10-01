const db = require('../db');

async function createUser(fullName, email, passwordHash, role = 'User') {
  const sql = 'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(sql, [fullName, email, passwordHash, role], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function getUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(sql, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

async function getUserById(id) {
  const sql = 'SELECT id, fullName, email, role FROM users WHERE id = ? LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
