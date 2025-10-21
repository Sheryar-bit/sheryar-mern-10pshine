const sinon = require('sinon');
const { expect } = require('chai');
const db = require('../../db');
const User = require('../../models/userModel');

describe('User Model', () => {
  let queryStub;

  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 };
      queryStub = sinon.stub(db, 'query').yields(null, mockResult);

      const result = await User.createUser('John Doe', 'john@test.com', 'hashedPassword', 'User');

      expect(result.insertId).to.equal(1);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('INSERT INTO users');
      expect(queryStub.firstCall.args[1]).to.deep.equal(['John Doe', 'john@test.com', 'hashedPassword', 'User']);
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await User.createUser('John Doe', 'john@test.com', 'hashedPassword', 'User');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'john@test.com', fullName: 'John Doe', role: 'User' };
      queryStub = sinon.stub(db, 'query').yields(null, [mockUser]);

      const user = await User.getUserByEmail('john@test.com');

      expect(user).to.deep.equal(mockUser);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('SELECT * FROM users WHERE email = ?');
      expect(queryStub.firstCall.args[1]).to.deep.equal(['john@test.com']);
    });

    it('should return undefined when user not found', async () => {
      queryStub = sinon.stub(db, 'query').yields(null, []);

      const user = await User.getUserByEmail('notfound@test.com');

      expect(user).to.be.undefined;
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await User.getUserByEmail('john@test.com');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'john@test.com', fullName: 'John Doe', role: 'User' };
      queryStub = sinon.stub(db, 'query').yields(null, [mockUser]);

      const user = await User.getUserById(1);

      expect(user).to.deep.equal(mockUser);
      expect(queryStub.calledOnce).to.be.true;
      expect(queryStub.firstCall.args[0]).to.include('SELECT id, fullName, email, role FROM users WHERE id = ?');
      expect(queryStub.firstCall.args[1]).to.deep.equal([1]);
    });

    it('should return undefined when user not found', async () => {
      queryStub = sinon.stub(db, 'query').yields(null, []);

      const user = await User.getUserById(999);

      expect(user).to.be.undefined;
    });

    it('should handle database errors', async () => {
      queryStub = sinon.stub(db, 'query').yields(new Error('DB Error'), null);

      try {
        await User.getUserById(1);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('DB Error');
      }
    });
  });
});
