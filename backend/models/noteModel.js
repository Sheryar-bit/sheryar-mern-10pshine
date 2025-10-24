const db = require('../db');
const logger = require('../config/logger');

async function createNote(userId, title, content, role) {
  const sql = 'INSERT INTO notes (userId, title, content, role) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(sql, [userId, title, content, role], (err, result) => {
      if (err) {
        logger.error({ err, userId, title }, 'Database error: Failed to create note');
        return reject(err);
      }
      logger.debug({ noteId: result.insertId, userId, title }, 'Note record created in database');
      resolve(result);
    });
  });
}

async function getNotes(userId) {
  const sql = 'SELECT * FROM notes WHERE userId = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [userId], (err, results) => {
      if (err) {
        logger.error({ err, userId }, 'Database error: Failed to retrieve notes');
        return reject(err);
      }
      logger.debug({ userId, count: results.length }, 'Notes retrieved from database');
      resolve(results);
    });
  });
}

async function updateNote(noteId, title, content) {
  const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [title, content, noteId], (err, result) => {
      if (err) {
        logger.error({ err, noteId, title }, 'Database error: Failed to update note');
        return reject(err);
      }
      logger.debug({ noteId, title, affectedRows: result.affectedRows }, 'Note updated in database');
      resolve(result);
    });
  });
}

async function deleteNote(noteId) {
  const sql = 'DELETE FROM notes WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.query(sql, [noteId], (err, result) => {
      if (err) {
        logger.error({ err, noteId }, 'Database error: Failed to delete note');
        return reject(err);
      }
      logger.debug({ noteId, affectedRows: result.affectedRows }, 'Note deleted from database');
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
