const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehicles');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE available = true');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { brand, model, daily_rate, year, type, vehicle_number, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO vehicles (brand,model,daily_rate,year,type,vehicle_number,image_url) VALUES (?,?,?,?,?,?,?)',
      [brand, model, daily_rate, year, type, vehicle_number, image_url]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { brand, model, daily_rate, year, type, vehicle_number, image_url, available } = req.body;
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id=?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const current = rows[0];
    await db.query(
      'UPDATE vehicles SET brand=?,model=?,daily_rate=?,year=?,type=?,vehicle_number=?,image_url=?,available=? WHERE id=?',
      [
        brand ?? current.brand,
        model ?? current.model,
        daily_rate ?? current.daily_rate,
        year ?? current.year,
        type ?? current.type,
        vehicle_number ?? current.vehicle_number,
        image_url ?? current.image_url,
        available ?? current.available,
        req.params.id
      ]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM vehicles WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
