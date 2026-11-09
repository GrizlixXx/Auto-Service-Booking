import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'autofix_fallback_secret';
const BOT_INTERNAL_PORT = process.env.BOT_INTERNAL_PORT || 5050;

async function notifyBotNewUser(userLogin, userEmail, userPhone) {
  try {
    await fetch(`http://localhost:${BOT_INTERNAL_PORT}/notify/manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_login: userLogin,
        user_email: userEmail,
        user_phone: userPhone,
      }),
    });
  } catch (err) {
    // Do not fail user registration if the background notification bot is offline
    console.warn('[Auth] Could not notify bot:', err.message);
  }
}

router.post('/register', async (req, res) => {
  try {
    const { login, email, phone, password } = req.body;

    const loginRegex = /^[a-zA-Z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;

    if (!login || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!loginRegex.test(login)) {
      return res.status(400).json({ message: 'Login must contain only letters and numbers' });
    }
    if (!emailRegex.test(email) || password.length < 8 || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Security validation failed. Check your data.' });
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR user_login = ?',
      [email, login]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email or login already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Fallback handles schemas where the column was created as hashed_password instead of password
    try {
      await db.query(
        'INSERT INTO users (user_login, password, email, phone_number, role) VALUES (?, ?, ?, ?, ?)',
        [login, hashedPassword, email, phone, 'client']
      );
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          'INSERT INTO users (user_login, hashed_password, email, phone_number, role) VALUES (?, ?, ?, ?, ?)',
          [login, hashedPassword, email, phone, 'client']
        );
      } else {
        throw dbErr;
      }
    }

    notifyBotNewUser(login, email, phone);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('[Register]', error);
    res.status(500).json({ 
      message: error.sqlMessage || error.message || 'Server error during registration' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    const passwordHash = user.password || user.hashed_password;

    if (!passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials or missing password field' });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, login: user.user_login, role: user.role || 'client' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        login: user.user_login,
        email: user.email,
        phone: user.phone_number,
        avatar_url: (user.avatar_url && !user.avatar_url.includes('default') && !user.avatar_url.includes('profilesPhotos')) ? user.avatar_url : null,
        profilePhoto: (user.avatar_url && !user.avatar_url.includes('default') && !user.avatar_url.includes('profilesPhotos')) ? user.avatar_url : null,
        role: user.role || 'client',
      },
    });
  } catch (error) {
    console.error('[Login]', error);
    res.status(500).json({ 
      message: error.sqlMessage || error.message || 'Server error during login' 
    });
  }
});

export default router;
