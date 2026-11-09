import express from 'express';
import db from '../db.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const BOT_INTERNAL_PORT = process.env.BOT_INTERNAL_PORT || 5050;

async function notifyBotOperator(userLogin, reason, userPhone, userEmail) {
  try {
    await fetch(`http://localhost:${BOT_INTERNAL_PORT}/notify/operator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_login: userLogin,
        reason,
        user_phone: userPhone || 'N/A',
        user_email: userEmail || 'N/A',
      }),
    });
  } catch (err) {
    console.warn('[Operator] Could not notify bot:', err.message);
  }
}

router.post('/request', async (req, res) => {
  try {
    const { login, reason } = req.body;

    if (!login || !reason) {
      return res.status(400).json({ message: 'Login and reason are required' });
    }

    await db.query(
      'INSERT INTO operator_requests (user_login, reason) VALUES (?, ?)',
      [login, reason]
    );

    const [users] = await db.query(
      'SELECT phone_number, email FROM users WHERE user_login = ?',
      [login]
    );
    const user = users[0] || {};

    notifyBotOperator(login, reason, user.phone_number, user.email);

    res.status(201).json({
      message: 'Request created successfully. An operator will contact you shortly.',
    });
  } catch (error) {
    console.error('[Operator request]', error);
    res.status(500).json({ message: 'Server error adding request' });
  }
});

router.get('/requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id, 
        r.user_login, 
        r.reason, 
        r.created_at, 
        u.email, 
        u.phone_number,
        CASE 
          WHEN u.avatar_url LIKE '%default%' OR u.avatar_url LIKE '%profilesPhotos%' THEN NULL 
          ELSE u.avatar_url 
        END AS avatar_url 
      FROM operator_requests r 
      LEFT JOIN users u ON r.user_login = u.user_login 
      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('[Get operator requests]', error);
    res.status(500).json({ message: 'Server error retrieving requests' });
  }
});

router.delete('/request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM operator_requests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request closed successfully' });
  } catch (error) {
    console.error('[Delete request]', error);
    res.status(500).json({ message: 'Server error deleting request' });
  }
});

export default router;
