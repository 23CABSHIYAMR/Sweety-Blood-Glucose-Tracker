const bcrypt = require('bcryptjs');
const db = require('../db');
const { SLOTS } = require('../utils/constants');

async function seed() {
  console.log('🌱 Seeding Sweety database...');
  await db.initDb();

  const demoEmail = 'demo@sweety.local';
  const demoPassword = 'Password123!';
  const demoName = 'Demo Patient';

  // 1. Create or retrieve Demo User
  let user;
  const existingUser = await db.query(
    'SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)',
    [demoEmail]
  );

  if (existingUser.rows.length > 0) {
    user = existingUser.rows[0];
    console.log(`👤 Using existing demo user: ${user.email} (ID: ${user.id})`);
  } else {
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const insertRes = await db.query(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, name, email`,
      [demoName, demoEmail, passwordHash]
    );
    user = insertRes.rows[0];
    console.log(`👤 Created demo user: ${user.email} (ID: ${user.id})`);
  }

  // Clear existing readings for this demo user for idempotent fresh seeding
  await db.query('DELETE FROM readings WHERE user_id = $1', [user.id]);

  // 2. Generate sample readings for the last 45 days
  const now = new Date();
  let totalSeeded = 0;

  for (let daysAgo = 45; daysAgo >= 0; daysAgo--) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Seed up to 4 readings per day
    const sampleDayReadings = [
      { slot: 'Morning (fasting)', value: Math.floor(82 + Math.random() * 25) }, // 82 - 107
      { slot: 'After breakfast', value: Math.floor(115 + Math.random() * 35) }, // 115 - 150
      { slot: 'After lunch', value: Math.floor(120 + Math.random() * 40) },     // 120 - 160
      { slot: 'After dinner', value: Math.floor(110 + Math.random() * 30) }     // 110 - 140
    ];

    for (const reading of sampleDayReadings) {
      await db.query(
        `INSERT INTO readings (user_id, date, slot, value, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [user.id, dateStr, reading.slot, reading.value]
      );
      totalSeeded++;
    }
  }

  console.log(`🎉 Seeded ${totalSeeded} readings for ${user.email} across past 45 days!`);
  console.log('--------------------------------------------------');
  console.log('Demo Credentials:');
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);
  console.log('--------------------------------------------------');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
