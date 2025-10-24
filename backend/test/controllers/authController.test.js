const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const authController = require('../../controllers/authController');

describe('Auth Controller', () => {
  let req, res, getUserByEmailStub, createUserStub, bcryptHashStub, bcryptCompareStub;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@test.com' };

      await authController.register(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: 'Missing fields' })).to.be.true;
    });

    it('should return 409 if email already exists', async () => {
      req.body = {
        fullName: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').resolves({ id: 1 });

      await authController.register(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWith({ error: 'Email already registered' })).to.be.true;
    });

    it('should register a new user successfully', async () => {
      req.body = {
        fullName: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'User'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').resolves(null);
      bcryptHashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      createUserStub = sinon.stub(User, 'createUser').resolves({ insertId: 1 });

      await authController.register(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ message: 'User registered', userId: 1 })).to.be.true;
    });

    it('should handle server errors', async () => {
      req.body = {
        fullName: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').rejects(new Error('DB Error'));

      await authController.register(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      req.body = { email: 'test@test.com' };

      await authController.login(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: 'Missing fields' })).to.be.true;
    });

    it('should return 401 if user does not exist', async () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').resolves(null);

      await authController.login(req, res);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Invalid credentials' })).to.be.true;
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = {
        email: 'test@test.com',
        password: 'wrongpassword'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').resolves({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'User'
      });
      bcryptCompareStub = sinon.stub(bcrypt, 'compare').resolves(false);

      await authController.login(req, res);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ error: 'Invalid credentials' })).to.be.true;
    });

    it('should login user successfully and return token', async () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').resolves({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'User'
      });
      bcryptCompareStub = sinon.stub(bcrypt, 'compare').resolves(true);

      await authController.login(req, res);

      expect(res.json.called).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response).to.have.property('message', 'Logged in');
      expect(response).to.have.property('token');
    });

    it('should handle server errors during login', async () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };

      getUserByEmailStub = sinon.stub(User, 'getUserByEmail').rejects(new Error('DB Error'));

      await authController.login(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Server error' })).to.be.true;
    });
  });
});
