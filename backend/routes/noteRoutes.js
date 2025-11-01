const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.post('/', auth, noteController.createNote);
router.get('/', auth, noteController.getNotes);
router.get('/search', auth, noteController.searchNotes);
router.get('/export', auth, noteController.exportNotes);
router.post('/import', auth, noteController.importNotes);
router.get('/:userId', auth, noteController.getNotes);
router.put('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;
