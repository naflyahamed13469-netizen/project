const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    const role = req.query.role;
    let query = `
      SELECT 
        u.id, u.username, u.email, u.phone_number, u.role,
        c.national_id,
        d.license_number, d.license_type,
        a.access_level
      FROM users u
      LEFT JOIN customers c ON u.id = c.id AND u.role = 'customer'
      LEFT JOIN drivers d ON u.id = d.id AND u.role = 'driver'
      LEFT JOIN admins a ON u.id = a.id AND u.role = 'admin'
    `;
    if (role) {
      query += ` WHERE u.role = '${role}'`;
    }
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { username, email, phone_number, password, national_id, license_number, license_type, access_level, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password || 'RentAvroom@123', 10);

    const [result] = await db.query(
      'INSERT INTO users (username, email, phone_number, password, role) VALUES (?,?,?,?,?)',
      [username, email, phone_number, hashed, role]
    );

    const newId = result.insertId;

    if (role === 'customer') {
      await db.query(
        'INSERT INTO customers (id, national_id) VALUES (?,?)',
        [newId, national_id]
      );
    } else if (role === 'driver') {
      await db.query(
        'INSERT INTO drivers (id, license_number, license_type) VALUES (?,?,?)',
        [newId, license_number, license_type]
      );
    } else if (role === 'admin') {
      await db.query(
        'INSERT INTO admins (id, access_level) VALUES (?,?)',
        [newId, access_level || 'admin']
      );
    }

    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [user] = await db.query('SELECT role FROM users WHERE id=?', [req.params.id]);
    
    if (user.length > 0) {
      const role = user[0].role;
      if (role === 'customer') {
        await db.query('DELETE FROM customers WHERE id=?', [req.params.id]);
      } else if (role === 'driver') {
        await db.query('DELETE FROM drivers WHERE id=?', [req.params.id]);
      } else if (role === 'admin') {
        await db.query('DELETE FROM admins WHERE id=?', [req.params.id]);
      }
    }

    await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/profile', async (req, res) => {
  const { username, email, phone_number } = req.body;
  try {
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const [result] = await db.query(
      'UPDATE users SET username=?, email=?, phone_number=? WHERE id=?',
      [username, email, phone_number || null, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [rows] = await db.query(
      'SELECT id, username, email, phone_number, role FROM users WHERE id=?',
      [req.params.id]
    );
    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const [rows] = await db.query('SELECT id, password FROM users WHERE id=?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password=? WHERE id=?', [hashed, req.params.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
