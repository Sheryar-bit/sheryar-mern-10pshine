const Note = require('../models/noteModel');
const logger = require('../config/logger');
const { emitToUser } = require('../socket');

exports.createNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { title, content, role } = req.body;
    
    if (!userId || !title || !content || !role) {
      logger.warn({ userId, hasTitle: !!title, hasContent: !!content }, 'Create note with missing fields');
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const result = await Note.createNote(userId, title, content, role);
    const noteId = result.insertId;
    
    // Fetch the newly created note to get all data
    const newNote = await Note.getNoteById(noteId);
    
    logger.info({ userId, noteId, title, role }, 'Note created successfully');
    
    // Emit real-time update
    emitToUser(userId, 'note:created', newNote);
    
    res.status(201).json({ message: 'Note created', noteId, note: newNote });
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
    
    // Fetch updated note
    const updatedNote = await Note.getNoteById(noteId);
    
    logger.info({ userId: req.user?.id, noteId, title }, 'Note updated successfully');
    
    // Emit real-time update
    if (req.user?.id) {
      emitToUser(req.user.id, 'note:updated', updatedNote);
    }
    
    res.json({ message: 'Note updated', note: updatedNote });
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
    
    // Emit real-time update
    if (req.user?.id) {
      emitToUser(req.user.id, 'note:deleted', { id: noteId });
    }
    
    res.json({ message: 'Note deleted' });
  } catch (err) {
    logger.error({ err, noteId: req.params.id, userId: req.user?.id }, 'Note deletion failed');
    res.status(500).json({ error: 'Server error' });
  }
};

// Export notes to JSON
exports.exportNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    const notes = await Note.getNotes(userId);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalNotes: notes.length,
      notes: notes
    };
    
    logger.info({ userId, noteCount: notes.length }, 'Notes exported successfully');
    res.json(exportData);
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, 'Failed to export notes');
    res.status(500).json({ error: 'Server error' });
  }
};

// Import notes from JSON
exports.importNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { notes } = req.body;
    
    if (!notes || !Array.isArray(notes)) {
      logger.warn({ userId }, 'Import notes with invalid data');
      return res.status(400).json({ error: 'Invalid notes data' });
    }
    
    const results = [];
    for (const note of notes) {
      if (note.title && note.content) {
        const result = await Note.createNote(
          userId, 
          note.title, 
          note.content, 
          note.role || 'User'
        );
        results.push(result.insertId);
      }
    }
    
    logger.info({ userId, importedCount: results.length }, 'Notes imported successfully');
    
    // Emit real-time update for imported notes
    const allNotes = await Note.getNotes(userId);
    emitToUser(userId, 'notes:imported', { notes: allNotes });
    
    res.status(201).json({ 
      message: 'Notes imported', 
      importedCount: results.length 
    });
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, 'Notes import failed');
    res.status(500).json({ error: 'Server error' });
  }
};

// Search and filter notes
exports.searchNotes = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    const { query, role, startDate, endDate } = req.query;
    
    let notes = await Note.getNotes(userId);
    
    // Apply search query filter
    if (query) {
      const searchQuery = query.toLowerCase();
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery)
      );
    }
    
    // Apply role filter
    if (role && role !== 'All') {
      notes = notes.filter(note => note.role === role);
    }
    
    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      notes = notes.filter(note => new Date(note.created_at) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      notes = notes.filter(note => new Date(note.created_at) <= end);
    }
    
    logger.info({ 
      userId, 
      query, 
      role, 
      resultCount: notes.length 
    }, 'Notes search completed');
    
    res.json(notes);
  } catch (err) {
    logger.error({ err, userId: req.user?.id }, 'Notes search failed');
    res.status(500).json({ error: 'Server error' });
  }
};
