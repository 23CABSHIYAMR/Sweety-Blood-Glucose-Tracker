const db = require('../../db');

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateRanges(selectedDateStr) {
  const [year, month, day] = selectedDateStr.split('-').map(Number);

  const dailyDate = selectedDateStr;
  const mtdStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const mtdEndDate = selectedDateStr;

  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
  const prevMonthStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevMonthEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(daysInPrevMonth).padStart(2, '0')}`;

  return {
    daily: { date: dailyDate },
    mtd: { startDate: mtdStartDate, endDate: mtdEndDate },
    monthly: { startDate: prevMonthStartDate, endDate: prevMonthEndDate }
  };
}

async function getStatsForRange(userId, startDate, endDate) {
  const result = await db.query(
    `SELECT 
       COUNT(*) AS count,
       MAX(value) AS highest,
       MIN(value) AS lowest,
       AVG(value) AS average
     FROM readings
     WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
    [userId, startDate, endDate]
  );

  const row = result.rows[0];
  const count = parseInt(row.count, 10) || 0;

  if (count === 0) {
    return {
      count: 0,
      highest: null,
      lowest: null,
      average: null
    };
  }

  const highest = Number(row.highest);
  const lowest = Number(row.lowest);
  const avgNum = Number(row.average);
  const average = Math.round(avgNum * 10) / 10;

  return {
    count,
    highest,
    lowest,
    average
  };
}

async function getReports(req, res, next) {
  try {
    const userId = req.user.id;
    let selectedDate = req.query.date;

    if (!selectedDate) {
      selectedDate = formatDate(new Date());
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return res.status(400).json({ error: 'Please provide a valid date in YYYY-MM-DD format.' });
    }

    const today = formatDate(new Date());
    if (selectedDate > today) {
      return res.status(400).json({ error: 'Date cannot be in the future.' });
    }

    const ranges = calculateRanges(selectedDate);

    const [dailyStats, dailyReadingsRes, mtdStats, monthlyStats] = await Promise.all([
      getStatsForRange(userId, ranges.daily.date, ranges.daily.date),
      db.query(
        `SELECT id, user_id, date, slot, value, created_at
         FROM readings
         WHERE user_id = $1 AND date = $2
         ORDER BY id ASC`,
        [userId, ranges.daily.date]
      ),
      getStatsForRange(userId, ranges.mtd.startDate, ranges.mtd.endDate),
      getStatsForRange(userId, ranges.monthly.startDate, ranges.monthly.endDate)
    ]);

    const formattedDailyReadings = dailyReadingsRes.rows.map(r => {
      let dateStr = r.date;
      if (dateStr instanceof Date) {
        dateStr = formatDate(dateStr);
      } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      return { ...r, date: dateStr };
    });

    res.json({
      selectedDate,
      daily: {
        ...dailyStats,
        date: ranges.daily.date,
        readings: formattedDailyReadings
      },
      mtd: {
        ...mtdStats,
        startDate: ranges.mtd.startDate,
        endDate: ranges.mtd.endDate
      },
      monthly: {
        ...monthlyStats,
        startDate: ranges.monthly.startDate,
        endDate: ranges.monthly.endDate
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
  calculateRanges
};

