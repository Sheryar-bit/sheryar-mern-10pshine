const sinon = require('sinon');
const { expect } = require('chai');
const Note = require('../../models/noteModel');
const noteController = require('../../controllers/noteController');

describe('Note Controller', () => {
  let req, res, createNoteStub, getNotesStub, updateNoteStub, deleteNoteStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1, email: 'test@test.com', role: 'User' }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createNote', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { title: 'Test Note' };

      await noteController.createNote(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: 'Missing fields' })).to.be.true;
    });

    it('should create a note successfully', async () => {
      req.body = {
        title: 'Test Note',
        content: 'Test content',
        role: 'User'
      };

      createNoteStub = sinon.stub(Note, 'createNote').resolves({ insertId: 1 });

      await noteController.createNote(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ message: 'Note created', noteId: 1 })).to.be.true;
      expect(createNoteStub.calledWith(1, 'Test Note', 'Test content', 'User')).to.be.true;
    });

    it('should handle server errors', async () => {
      req.body = {
        title: 'Test Note',
        content: 'Test content',
        role: 'User'
      };

      createNoteStub = sinon.stub(Note, 'createNote').rejects(new Error('DB Error'));

      await noteController.createNote(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });

  describe('getNotes', () => {
    it('should retrieve notes for a user', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', content: 'Content 1', userId: 1 },
        { id: 2, title: 'Note 2', content: 'Content 2', userId: 1 }
      ];

      getNotesStub = sinon.stub(Note, 'getNotes').resolves(mockNotes);

      await noteController.getNotes(req, res);

      expect(res.json.calledWith(mockNotes)).to.be.true;
      expect(getNotesStub.calledWith(1)).to.be.true;
    });

    it('should return empty array if no notes found', async () => {
      getNotesStub = sinon.stub(Note, 'getNotes').resolves([]);

      await noteController.getNotes(req, res);

      expect(res.json.calledWith([])).to.be.true;
    });

    it('should handle server errors', async () => {
      getNotesStub = sinon.stub(Note, 'getNotes').rejects(new Error('DB Error'));

      await noteController.getNotes(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      req.params.id = '1';
      req.body = {
        title: 'Updated Note',
        content: 'Updated content'
      };

      updateNoteStub = sinon.stub(Note, 'updateNote').resolves({ affectedRows: 1 });

      await noteController.updateNote(req, res);

      expect(res.json.calledWith({ message: 'Note updated' })).to.be.true;
      expect(updateNoteStub.calledWith('1', 'Updated Note', 'Updated content')).to.be.true;
    });

    it('should handle server errors', async () => {
      req.params.id = '1';
      req.body = {
        title: 'Updated Note',
        content: 'Updated content'
      };

      updateNoteStub = sinon.stub(Note, 'updateNote').rejects(new Error('DB Error'));

      await noteController.updateNote(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      req.params.id = '1';

      deleteNoteStub = sinon.stub(Note, 'deleteNote').resolves({ affectedRows: 1 });

      await noteController.deleteNote(req, res);

      expect(res.json.calledWith({ message: 'Note deleted' })).to.be.true;
      expect(deleteNoteStub.calledWith('1')).to.be.true;
    });

    it('should handle server errors', async () => {
      req.params.id = '1';

      deleteNoteStub = sinon.stub(Note, 'deleteNote').rejects(new Error('DB Error'));

      await noteController.deleteNote(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });
});
