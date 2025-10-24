const Note = require('../models/noteModel');
const logger = require('../config/logger');

exports.createNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { title, content, role } = req.body;
    
    if (!userId || !title || !content || !role) {
      logger.warn({ userId, hasTitle: !!title, hasContent: !!content }, 'Create note with missing fields');
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const result = await Note.createNote(userId, title, content, role);
    logger.info({ userId, noteId: result.insertId, title, role }, 'Note created successfully');
    res.status(201).json({ message: 'Note created', noteId: result.insertId });
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, 'Note creation failed');
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    const notes = await Note.getNotes(userId);
    logger.info({ userId, noteCount: notes.length }, 'Notes retrieved successfully');
    res.json(notes);
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, 'Failed to retrieve notes');
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    await Note.updateNote(noteId, title, content);
    logger.info({ userId: req.user?.id, noteId, title }, 'Note updated successfully');
    res.json({ message: 'Note updated' });
  } catch (err) {
    logger.error({ err, noteId: req.params.id, userId: req.user?.id }, 'Note update failed');
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    await Note.deleteNote(noteId);
    logger.info({ userId: req.user?.id, noteId }, 'Note deleted successfully');
    res.json({ message: 'Note deleted' });
  } catch (err) {
    logger.error({ err, noteId: req.params.id, userId: req.user?.id }, 'Note deletion failed');
    res.status(500).json({ error: 'Server error' });
  }
};
