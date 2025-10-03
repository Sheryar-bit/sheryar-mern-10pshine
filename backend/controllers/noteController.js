const Note = require('../models/noteModel');

exports.createNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { title, content, role } = req.body;
    if (!userId || !title || !content || !role) return res.status(400).json({ error: 'Missing fields' });
    const result = await Note.createNote(userId, title, content, role);
    res.status(201).json({ message: 'Note created', noteId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    const notes = await Note.getNotes(userId);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    await Note.updateNote(noteId, title, content);
    res.json({ message: 'Note updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    await Note.deleteNote(noteId);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
