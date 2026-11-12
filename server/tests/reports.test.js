const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

describe('Reports API', () => {
  let token;

  beforeAll(async () => {
    await db.initDb();

    // Register user for reports test
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Report Patient',
        email: 'report_patient@example.com',
        password: 'Password123!'
      });
    token = userRes.body.token;

    // Seed readings for 15 Oct 2026 (Daily)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-15', slot: 'Morning (fasting)', value: 90 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-15', slot: 'After breakfast', value: 135 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-15', slot: 'After lunch', value: 145 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-15', slot: 'After dinner', value: 120 });

    // Seed readings for 05 Oct 2026 (Part of Month-to-date Oct 1 - Oct 15)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-05', slot: 'Morning (fasting)', value: 100 });

    // Seed readings for Sep 2026 (Part of Monthly previous month)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-09-10', slot: 'Morning (fasting)', value: 80 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-09-20', slot: 'After dinner', value: 160 });
  });

  test('GET /api/reports?date=2026-10-15 - generates correct Daily, MTD, and Monthly reports', async () => {
    const res = await request(app)
      .get('/api/reports?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // 1. Daily report
    expect(res.body.daily.date).toBe('2026-10-15');
    expect(res.body.daily.count).toBe(4);
    expect(res.body.daily.highest).toBe(145);
    expect(res.body.daily.lowest).toBe(90);
    // Average of 90, 135, 145, 120 = 490 / 4 = 122.5
    expect(res.body.daily.average).toBe(122.5);
    expect(res.body.daily.readings.length).toBe(4);

    // 2. Month-to-date (1 Oct to 15 Oct 2026)
    expect(res.body.mtd.startDate).toBe('2026-10-01');
    expect(res.body.mtd.endDate).toBe('2026-10-15');
    expect(res.body.mtd.count).toBe(5); // 4 from 15th + 1 from 5th
    expect(res.body.mtd.highest).toBe(145);
    expect(res.body.mtd.lowest).toBe(90);
    // Average: (490 + 100) / 5 = 118.0
    expect(res.body.mtd.average).toBe(118.0);

    // 3. Monthly (Whole previous month: 1 Sep to 30 Sep 2026)
    expect(res.body.monthly.startDate).toBe('2026-09-01');
    expect(res.body.monthly.endDate).toBe('2026-09-30');
    expect(res.body.monthly.count).toBe(2);
    expect(res.body.monthly.highest).toBe(160);
    expect(res.body.monthly.lowest).toBe(80);
    expect(res.body.monthly.average).toBe(120.0);
  });

  test('GET /api/reports?date=2026-01-15 - returns friendly empty states when no readings exist', async () => {
    const res = await request(app)
      .get('/api/reports?date=2026-01-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.daily.count).toBe(0);
    expect(res.body.daily.highest).toBeNull();
    expect(res.body.daily.lowest).toBeNull();
    expect(res.body.daily.average).toBeNull();
    expect(res.body.daily.readings).toEqual([]);

    expect(res.body.mtd.count).toBe(0);
    expect(res.body.monthly.count).toBe(0);
  });

  test('GET /api/reports - rejects invalid date format', async () => {
    const res = await request(app)
      .get('/api/reports?date=invalid-date')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid date in YYYY-MM-DD/i);
  });
});
