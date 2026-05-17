const express = require('express');
const router = express.Router();
const db = require('../db');

const reviewSelectQuery = `
  SELECT
    r.*,
    r.rental_id AS rentalId,
    r.review_date AS reviewDate,
    rt.customer_id,
    rt.customer_id AS customerId,
    u.username AS customer_name,
    u.username AS customerName,
    u.email AS customer_email,
    u.email AS customerEmail,
    v.brand,
    v.model,
    CONCAT(v.brand, ' ', v.model) AS vehicleName
  FROM reviews r
  JOIN rentals rt ON r.rental_id = rt.id
  JOIN customers c ON rt.customer_id = c.id
  JOIN users u ON c.id = u.id
  JOIN vehicles v ON rt.vehicle_id = v.id
`;

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(reviewSelectQuery);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { rental_id, rating, comment } = req.body;
    await db.query(
      'INSERT INTO reviews (rental_id,rating,comment,review_date) VALUES (?,?,?,CURDATE())',
      [rental_id, rating, comment]
    );
    res.json({ message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `${reviewSelectQuery} WHERE r.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const current = rows[0];
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [
        rating ?? current.rating,
        comment ?? current.comment,
        req.params.id,
      ]
    );

    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
