const db = require('../../db');
const { SLOTS, formatSlotError } = require('../../utils/constants');

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function validateReadingInput({ userId, date, slot, value, readingId = null }) {
  if (value === undefined || value === null || value === '') {
    return { valid: false, status: 400, message: 'Please enter a glucose value.' };
  }

  const numValue = Number(value);
  if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
    return { valid: false, status: 400, message: 'Value must be between 40 and 600 mg/dl.' };
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, status: 400, message: 'Please provide a valid date in YYYY-MM-DD format.' };
  }

  const today = getTodayString();
  if (date > today) {
    return { valid: false, status: 400, message: 'Date cannot be in the future.' };
  }

  if (!slot || !SLOTS.includes(slot)) {
    return {
      valid: false,
      status: 400,
      message: `Invalid slot. Must be one of: ${SLOTS.join(', ')}`
    };
  }

  let slotCheckQuery = 'SELECT id FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3';
  const slotCheckParams = [userId, date, slot];
  if (readingId) {
    slotCheckQuery += ' AND id != $4';
    slotCheckParams.push(readingId);
  }

  const existingSlot = await db.query(slotCheckQuery, slotCheckParams);
  if (existingSlot.rows.length > 0) {
    return {
      valid: false,
      status: 400,
      message: formatSlotError(slot)
    };
  }

  if (!readingId) {
    const countCheck = await db.query(
      'SELECT COUNT(*) AS total FROM readings WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    if (parseInt(countCheck.rows[0].total, 10) >= 4) {
      return { valid: false, status: 400, message: 'You can add only 4 readings per day.' };
    }
  }

  return { valid: true, sanitizedValue: numValue };
}

function formatReading(r) {
  if (!r) return r;
  let dateStr = r.date;
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear();
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const day = String(dateStr.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  return {
    ...r,
    date: dateStr
  };
}

async function getReadings(req, res, next) {
  try {
    const userId = req.user.id;
    const { date, startDate, endDate, page, limit } = req.query;

    let queryText = 'SELECT id, user_id, date, slot, value, created_at, updated_at FROM readings WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (date) {
      queryText += ` AND date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    } else if (startDate && endDate) {
      queryText += ` AND date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    queryText += ' ORDER BY date DESC, id DESC';

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = 15; // Pagination limit is always strictly 15
      const offset = (pageNum - 1) * limitNum;

      const countRes = await db.query(
        `SELECT COUNT(*) FROM (${queryText}) AS filtered`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limitNum, offset);

      const result = await db.query(queryText, params);

      return res.json({
        readings: result.rows.map(formatReading),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    }

    const result = await db.query(queryText, params);
    res.json({ readings: result.rows.map(formatReading) });
  } catch (err) {
    next(err);
  }
}

async function getReadingById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, user_id, date, slot, value, created_at, updated_at
       FROM readings WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    res.json({ reading: formatReading(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function createReading(req, res, next) {
  try {
    const userId = req.user.id;
    const { date, slot, value } = req.body;

    const validation = await validateReadingInput({ userId, date, slot, value });
    if (!validation.valid) {
      return res.status(validation.status).json({ error: validation.message });
    }

    const result = await db.query(
      `INSERT INTO readings (user_id, date, slot, value, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, user_id, date, slot, value, created_at, updated_at`,
      [userId, date, slot, validation.sanitizedValue]
    );

    res.status(201).json({
      message: 'Reading added successfully.',
      reading: formatReading(result.rows[0])
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: formatSlotError(req.body.slot) });
    }
    next(err);
  }
}

async function updateReading(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { date, slot, value } = req.body;

    const existing = await db.query(
      'SELECT id FROM readings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    const validation = await validateReadingInput({
      userId,
      date,
      slot,
      value,
      readingId: id
    });

    if (!validation.valid) {
      return res.status(validation.status).json({ error: validation.message });
    }

    const result = await db.query(
      `UPDATE readings
       SET date = $1, slot = $2, value = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, date, slot, value, created_at, updated_at`,
      [date, slot, validation.sanitizedValue, id, userId]
    );

    res.json({
      message: 'Reading updated successfully.',
      reading: formatReading(result.rows[0])
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: formatSlotError(req.body.slot) });
    }
    next(err);
  }
}

async function deleteReading(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    res.json({ message: 'Reading deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/readings/seed-demo
 * Seeds realistic readings for the authenticated user for the past 45 days
 */
async function seedDemoReadings(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Clear existing readings for fresh demo state
    await db.query('DELETE FROM readings WHERE user_id = $1', [userId]);

    let totalSeeded = 0;
    const slots = [
      { slot: 'Morning (fasting)', base: 82, spread: 25 },
      { slot: 'After breakfast', base: 115, spread: 35 },
      { slot: 'After lunch', base: 120, spread: 40 },
      { slot: 'After dinner', base: 110, spread: 30 }
    ];

    for (let daysAgo = 45; daysAgo >= 0; daysAgo--) {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      for (const item of slots) {
        const val = Math.floor(item.base + Math.random() * item.spread);
        await db.query(
          `INSERT INTO readings (user_id, date, slot, value, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [userId, dateStr, item.slot, val]
        );
        totalSeeded++;
      }
    }

    res.json({
      message: `Successfully seeded ${totalSeeded} readings across the past 45 days!`,
      count: totalSeeded
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReadings,
  getReadingById,
  createReading,
  updateReading,
  deleteReading,
  seedDemoReadings
};

