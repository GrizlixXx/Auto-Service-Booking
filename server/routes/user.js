import express from 'express';
import db from '../db.js';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory buffer allows sharp to process and compress images without writing uncompressed raw files to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, etc.) are permitted!'), false);
    }
  },
});

router.get('/profile/:login', async (req, res) => {
  try {
    const { login } = req.params;
    const [users] = await db.query(
      'SELECT id, user_login, email, phone_number, avatar_url, role FROM users WHERE user_login = ?',
      [login]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const u = users[0];
    const safeAvatarUrl = (u.avatar_url && !u.avatar_url.includes('default') && !u.avatar_url.includes('profilesPhotos')) ? u.avatar_url : null;
    res.json({
      id: u.id,
      login: u.user_login,
      email: u.email,
      phone: u.phone_number,
      avatar_url: safeAvatarUrl,
      profilePhoto: safeAvatarUrl,
      role: u.role || 'client',
    });
  } catch (error) {
    console.error('[Get Profile]', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const login = req.body.login;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    if (!login) {
      return res.status(400).json({ message: 'User login is required' });
    }

    const sanitizedLogin = login.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `avatar-${sanitizedLogin}-${Date.now()}.webp`;
    const targetFilePath = path.join(uploadDir, filename);

    const webpBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    await fs.promises.writeFile(targetFilePath, webpBuffer);

    const newAvatarUrl = `/uploads/avatars/${filename}`;

    const [users] = await db.query('SELECT avatar_url FROM users WHERE user_login = ?', [login]);
    if (users.length > 0 && users[0].avatar_url) {
      const oldAvatarUrl = users[0].avatar_url;
      if (
        (oldAvatarUrl.startsWith('/uploads/avatars/') || oldAvatarUrl.startsWith('/src/images/profilesPhotos/')) &&
        !oldAvatarUrl.includes('default.png')
      ) {
        const oldFilePath = path.join(__dirname, '../..', oldAvatarUrl);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.warn('[Avatar Cleanup] Could not delete old file:', err.message);
          }
        }
      }
    }

    await db.query('UPDATE users SET avatar_url = ? WHERE user_login = ?', [newAvatarUrl, login]);

    res.json({
      message: 'Avatar uploaded and converted to WebP successfully!',
      avatarUrl: newAvatarUrl,
      sizeBytes: webpBuffer.length,
      format: 'webp',
    });
  } catch (error) {
    console.error('[Upload Avatar]', error);
    res.status(500).json({ message: error.message || 'Server error processing avatar' });
  }
});

router.delete('/avatar/:login', async (req, res) => {
  try {
    const { login } = req.params;

    const [users] = await db.query('SELECT avatar_url FROM users WHERE user_login = ?', [login]);
    if (users.length > 0 && users[0].avatar_url) {
      const oldAvatarUrl = users[0].avatar_url;
      if (oldAvatarUrl.startsWith('/uploads/avatars/') && !oldAvatarUrl.includes('default.png')) {
        const oldFilePath = path.join(__dirname, '../..', oldAvatarUrl);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch {}
        }
      }
      await db.query('UPDATE users SET avatar_url = NULL WHERE user_login = ?', [login]);
    }

    res.json({ message: 'Avatar removed successfully', avatarUrl: null });
  } catch (error) {
    console.error('[Delete Avatar]', error);
    res.status(500).json({ message: 'Server error removing avatar' });
  }
});

router.put('/update-profile', async (req, res) => {
  try {
    const { currentLogin, newLogin, newEmail } = req.body;

    if (!currentLogin || !newLogin || !newEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [users] = await db.query('SELECT id FROM users WHERE user_login = ?', [currentLogin]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = users[0].id;

    const [conflicts] = await db.query(
      'SELECT id FROM users WHERE (user_login = ? OR email = ?) AND id != ?',
      [newLogin, newEmail, userId]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Login or Email already taken' });
    }

    await db.query('UPDATE users SET user_login = ?, email = ? WHERE id = ?', [newLogin, newEmail, userId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[Update Profile]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
