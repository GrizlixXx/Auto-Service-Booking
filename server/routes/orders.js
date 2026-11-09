import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/getCarStatus', async (req, res) => {
  try {
    const { login } = req.query;

    const [rows] = await db.query(
      `
      SELECT b.mark, b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE u.user_login = ?
    `,
      [login]
    );

    const carsFromDB = {};
    rows.forEach(row => {
      carsFromDB[row.mark] = row.status;
    });

    res.status(200).json({ cars: carsFromDB });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:login', async (req, res) => {
  try {
    const login = req.params.login;

    const [orders] = await db.query(
      `SELECT b.id, b.mark AS car_mark, b.services, b.time AS order_date, b.status,
              s.name AS salon_name, c.name AS city_name, st.name AS street_name, s.building
       FROM bookings b 
       JOIN users u ON b.email = u.email 
       LEFT JOIN salons s ON b.salon_id = s.id
       LEFT JOIN cities c ON s.city_id = c.id
       LEFT JOIN streets st ON s.street_id = st.id
       WHERE u.user_login = ?
       ORDER BY b.id DESC`,
      [login]
    );

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addOrder', async (req, res) => {
  try {
    const { login, phone, mark, services, time, salon_id, slot_datetime } = req.body;

    if (!login || !phone || !mark || !services || !time) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const [users] = await db.query('SELECT id, email FROM users WHERE user_login = ?', [login]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];

    const newBooking = {
      user_id: user.id,
      phone_number: phone,
      email: user.email,
      mark: mark,
      services: Array.isArray(services) ? services.join(', ') : services,
      time: time,
      salon_id: salon_id || null,
      slot_datetime: slot_datetime || time || null,
      status: 'Pending',
    };

    await db.query('INSERT INTO bookings SET ?', newBooking);

    res.status(201).json({ message: 'Booking created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
