const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

beforeAll(async () => {
  await db.initDb();
});

describe('Authentication API (Feature: Auth)', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane_slice@example.com',
    password: 'Password123!'
  };

  test('POST /api/auth/register - successfully registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('POST /api/auth/register - rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: 'short_slice@example.com',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6 characters/i);
  });

  test('POST /api/auth/login - successfully logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/login - fails with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  test('GET /api/auth/me - returns user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email);
  });

  test('GET /api/auth/me - rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
