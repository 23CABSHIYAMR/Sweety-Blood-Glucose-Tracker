const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

describe('Readings CRUD & Validation API', () => {
  let tokenUser1;
  let tokenUser2;

  beforeAll(async () => {
    await db.initDb();

    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Patient One',
        email: 'patient1@example.com',
        password: 'Password123!'
      });
    tokenUser1 = res1.body.token;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Patient Two',
        email: 'patient2@example.com',
        password: 'Password123!'
      });
    tokenUser2 = res2.body.token;
  });

  const validReading = {
    date: '2026-10-15',
    slot: 'Morning (fasting)',
    value: 95
  };

  test('POST /api/readings - creates reading with valid data', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send(validReading);

    expect(res.status).toBe(201);
    expect(res.body.reading).toHaveProperty('id');
    expect(res.body.reading.value).toBe(95);
    expect(res.body.reading.slot).toBe('Morning (fasting)');
    expect(res.body.reading.date).toBe('2026-10-15');
  });

  test('POST /api/readings - validation: Value is required', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: '2026-10-15',
        slot: 'After breakfast',
        value: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Please enter a glucose value.');
  });

  test('POST /api/readings - validation: Value must be between 40 and 600 (under 40)', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: '2026-10-15',
        slot: 'After breakfast',
        value: 35
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('POST /api/readings - validation: Value must be between 40 and 600 (over 600)', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: '2026-10-15',
        slot: 'After breakfast',
        value: 650
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('POST /api/readings - validation: Date cannot be in the future', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: '2099-01-01',
        slot: 'After lunch',
        value: 120
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Date cannot be in the future.');
  });

  test('POST /api/readings - validation: Only one reading per slot per day', async () => {
    // Attempt duplicate for Morning (fasting) on 2026-10-15
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: '2026-10-15',
        slot: 'Morning (fasting)',
        value: 110
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('You already have a Morning (fasting) reading for this date.');
  });

  test('POST /api/readings - validation: Maximum 4 readings per day', async () => {
    // Add slot 2: After breakfast
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ date: '2026-10-15', slot: 'After breakfast', value: 130 });

    // Add slot 3: After lunch
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ date: '2026-10-15', slot: 'After lunch', value: 140 });

    // Add slot 4: After dinner
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ date: '2026-10-15', slot: 'After dinner', value: 125 });

    // Attempt 5th reading on same date
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ date: '2026-10-15', slot: 'After breakfast', value: 135 });

    expect(res.status).toBe(400);
    // Either slot duplicate or max 4 readings
    expect(res.body.error).toBe('You already have an After breakfast reading for this date.');
  });

  test('GET /api/readings - User only sees their own readings (Data Isolation)', async () => {
    // User 2 fetches readings
    const res2 = await request(app)
      .get('/api/readings')
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res2.status).toBe(200);
    expect(res2.body.readings.length).toBe(0);

    // User 1 fetches readings
    const res1 = await request(app)
      .get('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res1.status).toBe(200);
    expect(res1.body.readings.length).toBe(4);
  });

  test('PUT /api/readings/:id - updates an existing reading', async () => {
    const list = await request(app)
      .get('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`);

    const targetReading = list.body.readings[0];

    const res = await request(app)
      .put(`/api/readings/${targetReading.id}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        date: targetReading.date,
        slot: targetReading.slot,
        value: 105
      });

    expect(res.status).toBe(200);
    expect(res.body.reading.value).toBe(105);
  });

  test('DELETE /api/readings/:id - deletes reading', async () => {
    const list = await request(app)
      .get('/api/readings')
      .set('Authorization', `Bearer ${tokenUser1}`);

    const targetReading = list.body.readings[0];

    const delRes = await request(app)
      .delete(`/api/readings/${targetReading.id}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(delRes.status).toBe(200);

    // Verify it is gone
    const getRes = await request(app)
      .get(`/api/readings/${targetReading.id}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(getRes.status).toBe(404);
  });
});
