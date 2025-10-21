const sinon = require('sinon');
const { expect } = require('chai');
const db = require('../../db');
const Note = require('../../models/noteModel');

describe('Note Model', () => {
  let queryStub;

  afterEach(() => {
    sinon.restore();
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 };
      queryStub = sinon.stub(db, 'query').yields(null, mockResult);

      const result = await Note.createNote(1, 'Test Note', 'Test content', 'User');

      expect(result.insertId).to.equal(1);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('INSERT INTO notes');
      expect(queryStub.firstCall.args[1]).to.deep.equal([1, 'Test Note', 'Test content', 'User']);
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await Note.createNote(1, 'Test Note', 'Test content', 'User');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });

  describe('getNotes', () => {
    it('should return all notes for a user', async () => {
      const mockNotes = [
        { id: 1, userId: 1, title: 'Note 1', content: 'Content 1', role: 'User' },
        { id: 2, userId: 1, title: 'Note 2', content: 'Content 2', role: 'User' }
      ];
      queryStub = sinon.stub(db, 'query').yields(null, mockNotes);

      const notes = await Note.getNotes(1);

      expect(notes).to.have.lengthOf(2);
      expect(notes).to.deep.equal(mockNotes);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('SELECT * FROM notes WHERE userId = ?');
      expect(queryStub.firstCall.args[1]).to.deep.equal([1]);
    });

    it('should return empty array when no notes found', async () => {
      queryStub = sinon.stub(db, 'query').yields(null, []);

      const notes = await Note.getNotes(999);

      expect(notes).to.be.an('array').that.is.empty;
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await Note.getNotes(1);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      const mockResult = { affectedRows: 1 };
      queryStub = sinon.stub(db, 'query').yields(null, mockResult);

      const result = await Note.updateNote(1, 'Updated Title', 'Updated content');

      expect(result.affectedRows).to.equal(1);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('UPDATE notes SET title = ?, content = ? WHERE id = ?');
      expect(queryStub.firstCall.args[1]).to.deep.equal(['Updated Title', 'Updated content', 1]);
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await Note.updateNote(1, 'Updated Title', 'Updated content');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      const mockResult = { affectedRows: 1 };
      queryStub = sinon.stub(db, 'query').yields(null, mockResult);

      const result = await Note.deleteNote(1);

      expect(result.affectedRows).to.equal(1);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('DELETE FROM notes WHERE id = ?');
      expect(queryStub.firstCall.args[1]).to.deep.equal([1]);
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await Note.deleteNote(1);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });
});
