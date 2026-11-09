import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { salon_id, date } = req.query;

    if (!salon_id || !date) {
      return res.status(400).json({ message: 'salon_id and date are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const [salons] = await db.query(
      'SELECT open_time, close_time, slot_minutes FROM salons WHERE id = ?',
      [salon_id]
    );

    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const { open_time, close_time, slot_minutes } = salons[0];
    const slots = generateSlots(open_time, close_time, slot_minutes);

    const [booked] = await db.query(
      `SELECT TIME_FORMAT(slot_datetime, '%H:%i') AS booked_time
       FROM bookings
       WHERE salon_id = ?
         AND DATE(slot_datetime) = ?
         AND status != 'cancelled'`,
      [salon_id, date]
    );

    const bookedTimes = new Set(booked.map(b => b.booked_time));

    // Handle legacy records where booking timestamps were stored in `time` instead of `slot_datetime`
    const [legacyBooked] = await db.query(
      `SELECT TIME_FORMAT(time, '%H:%i') AS booked_time
       FROM bookings
       WHERE salon_id = ?
         AND DATE(time) = ?
         AND slot_datetime IS NULL
         AND status != 'cancelled'`,
      [salon_id, date]
    );
    legacyBooked.forEach(b => bookedTimes.add(b.booked_time));

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const isToday = date === todayStr;

    // For today: a slot is only valid if its start time is at least 1 hour from now.
    const minAllowedMinutes = isToday
      ? (now.getHours() + 1) * 60 + now.getMinutes()
      : 0;

    // A past date has no available slots at all.
    const selectedDateMs = new Date(date).getTime();
    const todayMs = new Date(todayStr).getTime();
    const isPast = selectedDateMs < todayMs;

    const toMinutes = t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const result = slots.map(time => ({
      time,
      available:
        !isPast &&
        !bookedTimes.has(time) &&
        (!isToday || toMinutes(time) >= minAllowedMinutes),
    }));

    res.json({ date, salon_id: parseInt(salon_id), slots: result });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
});

function generateSlots(open, close, step) {
  const slots = [];
  const toMinutes = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  let current = toMinutes(open);
  const end = toMinutes(close);

  while (current + step <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0');
    const m = String(current % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += step;
  }

  return slots;
}

export default router;
