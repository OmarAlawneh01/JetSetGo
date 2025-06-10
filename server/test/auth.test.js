const express = require('express');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const authRouter = require('../src/routes/auth');
const User = require('../src/models/User');

describe('Auth routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      sinon.stub(User.prototype, 'isPasswordValid').returns(true);
      const saveStub = sinon.stub(User.prototype, 'save').resolves();

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Valid123!',
          preferences: {}
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('username', 'testuser');
      expect(saveStub.calledOnce).to.be.true;
    });

    it('should return 400 if user exists', async () => {
      sinon.stub(User, 'findOne').resolves({ _id: '123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Valid123!'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'User already exists');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // too short
          email: 'invalid-email',
          password: '123'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors).to.be.an('array');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return token', async () => {
      const fakeUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        bio: '',
        preferences: {},
        password: 'hashedPassword',
        comparePassword: sinon.stub().resolves(true),
      };

      sinon.stub(User, 'findOne').returns({
        select: sinon.stub().resolves(fakeUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Valid123!' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('username', 'testuser');
      expect(fakeUser.comparePassword.calledOnce).to.be.true;
    });

    it('should return 400 on invalid credentials (user not found)', async () => {
      sinon.stub(User, 'findOne').returns({
        select: sinon.stub().resolves(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'password' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });

    it('should return 400 on invalid credentials (wrong password)', async () => {
      const fakeUser = {
        password: 'hashedPassword',
        comparePassword: sinon.stub().resolves(false),
      };

      sinon.stub(User, 'findOne').returns({
        select: sinon.stub().resolves(fakeUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpass' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: '' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors');
    });
  });

  // تمت إزالة اختبارات GET /api/auth/me

  describe('PUT /api/auth/profile', () => {
    it('should update profile when token is valid and data is valid', async () => {
      const userId = 'user123';
      sinon.stub(jwt, 'verify').returns({ userId });

      const userMock = {
        _id: userId,
        username: 'oldname',
        email: 'old@example.com',
        bio: '',
        preferences: {},
        isPasswordValid: sinon.stub().returns(true),
        save: sinon.stub().resolves()
      };
      sinon.stub(User, 'findById').resolves(userMock);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer validtoken')
        .send({ username: 'newname', password: 'Valid123!' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Profile updated successfully');
      expect(res.body.user).to.have.property('username', 'newname');
      expect(userMock.save.calledOnce).to.be.true;
    });

    it('should return 400 if password validation fails', async () => {
      const userId = 'user123';
      sinon.stub(jwt, 'verify').returns({ userId });

      const userMock = {
        isPasswordValid: sinon.stub().returns(false),
        save: sinon.stub()
      };
      sinon.stub(User, 'findById').resolves(userMock);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer validtoken')
        .send({ password: 'badpass' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.includes('Password must contain');
      expect(userMock.save.notCalled).to.be.true;
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app).put('/api/auth/profile').send({ username: 'newname' });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('message', 'No token, authorization denied');
    });

    it('should return 404 if user not found', async () => {
      sinon.stub(jwt, 'verify').returns({ userId: 'user123' });
      sinon.stub(User, 'findById').resolves(null);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer validtoken')
        .send({ username: 'newname' });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message', 'User not found');
    });
  });
});
