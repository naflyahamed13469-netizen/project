const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching payments...');
    const [rows] = await db.query(`
      SELECT *
      FROM (
        SELECT
          p.id,
          p.rental_id,
          p.amount_paid,
          p.payment_method,
          p.transaction_id,
          p.payment_date
        FROM payments p

        UNION ALL

        SELECT
          NULL AS id,
          r.id AS rental_id,
          COALESCE(rc.final_total, r.total_cost) AS amount_paid,
          'Completed Rental' AS payment_method,
          CONCAT('AUTO-', r.id) AS transaction_id,
          COALESCE(r.end_date, r.start_date) AS payment_date
        FROM rentals r
        LEFT JOIN payments p ON p.rental_id = r.id
        LEFT JOIN receipts rc ON rc.rental_id = r.id
        WHERE r.status = 'Completed' AND p.id IS NULL
      ) payment_feed
      ORDER BY payment_date DESC, rental_id DESC
    `);
    console.log('Payments found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { rental_id, amount_paid, payment_method, transaction_id } = req.body;
    await db.query(
      'INSERT INTO payments (rental_id,amount_paid,payment_method,transaction_id,payment_date) VALUES (?,?,?,?,NOW())',
      [rental_id, amount_paid, payment_method, transaction_id]
    );
    res.json({ message: 'Payment processed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
