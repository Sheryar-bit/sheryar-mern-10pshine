const sinon = require('sinon');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const authMiddleware = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next, getUserByIdStub;

  beforeEach(() => {
    req = {
      headers: {},
      path: '/api/notes',
      method: 'GET'
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 401 if no authorization header', async () => {
    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Unauthorized' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'InvalidToken';

    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Unauthorized' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';

    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid token' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should return 401 if user not found', async () => {
    const token = jwt.sign({ id: 999, role: 'User' }, 'dev_secret_change_me');
    req.headers.authorization = `Bearer ${token}`;

    getUserByIdStub = sinon.stub(User, 'getUserById').resolves(null);

    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Unauthorized' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should authenticate user and call next', async () => {
    const mockUser = { id: 1, email: 'test@test.com', fullName: 'Test User', role: 'User' };
    const token = jwt.sign({ id: 1, role: 'User' }, 'dev_secret_change_me');
    req.headers.authorization = `Bearer ${token}`;

    getUserByIdStub = sinon.stub(User, 'getUserById').resolves(mockUser);

    await authMiddleware(req, res, next);

    expect(req.user).to.deep.equal(mockUser);
    expect(next.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should handle JWT verification errors', async () => {
    req.headers.authorization = 'Bearer expired.or.malformed.token';

    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid token' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should handle database errors when fetching user', async () => {
    const token = jwt.sign({ id: 1, role: 'User' }, 'dev_secret_change_me');
    req.headers.authorization = `Bearer ${token}`;

    getUserByIdStub = sinon.stub(User, 'getUserById').rejects(new Error('DB Error'));

    await authMiddleware(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid token' })).to.be.true;
    expect(next.called).to.be.false;
  });
});
