const db = require('../db');

// Create a new note
async function createNote(userId, title, content, role) {
  const sql = 'INSERT INTO notes (userId, title, content, role) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(sql, [userId, title, content, role], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Get all notes for a user
async function getNotes(userId) {
  const sql = 'SELECT * FROM notes WHERE userId = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Update a note
async function updateNote(noteId, title, content) {
  const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [title, content, noteId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Delete a note
async function deleteNote(noteId) {
  const sql = 'DELETE FROM notes WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [noteId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote
};
