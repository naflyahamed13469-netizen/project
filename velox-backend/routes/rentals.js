const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, 
        u1.username as customer_name,
        u1.email as customer_email,
        u1.phone_number as customer_phone,
        u2.username as driver_name,
        d.license_number as driver_license,
        v.brand, v.model, v.daily_rate, v.vehicle_number, v.type, v.year
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u1 ON c.id = u1.id
      JOIN drivers d ON r.driver_id = d.id
      JOIN users u2 ON d.id = u2.id
      JOIN vehicles v ON r.vehicle_id = v.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_id, driver_id, vehicle_id, start_date, end_date, total_cost } = req.body;
    const [result] = await db.query(
      'INSERT INTO rentals (customer_id,driver_id,vehicle_id,start_date,end_date,total_cost,status) VALUES (?,?,?,?,?,?,?)',
      [customer_id, driver_id, vehicle_id, start_date, end_date, total_cost, 'Active']
    );
    await db.query('UPDATE vehicles SET available=false WHERE id=?', [vehicle_id]);
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rentals] = await connection.query('SELECT * FROM rentals WHERE id=?', [req.params.id]);
    if (rentals.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Rental not found' });
    }

    const rental = rentals[0];

    await connection.query('UPDATE rentals SET status=? WHERE id=?', ['Completed', req.params.id]);
    await connection.query('UPDATE vehicles SET available=true WHERE id=?', [rental.vehicle_id]);

    const [existingReceipts] = await connection.query(
      'SELECT id FROM receipts WHERE rental_id=? LIMIT 1',
      [req.params.id]
    );

    if (existingReceipts.length === 0) {
      await connection.query(
        'INSERT INTO receipts (rental_id, base_cost, late_fee, final_total) VALUES (?, ?, ?, ?)',
        [req.params.id, rental.total_cost, 0, rental.total_cost]
      );
    }

    const [existingPayments] = await connection.query(
      'SELECT id FROM payments WHERE rental_id=? LIMIT 1',
      [req.params.id]
    );

    if (existingPayments.length === 0) {
      await connection.query(
        'INSERT INTO payments (rental_id, amount_paid, payment_method, transaction_id, payment_date) VALUES (?, ?, ?, ?, NOW())',
        [req.params.id, rental.total_cost, 'Credit Card', `TXN${req.params.id}${Date.now()}`]
      );
    }

    await connection.commit();

    res.json({ message: 'Rental completed' });
  } catch (err) {
    await connection.rollback();
    console.error('Error completing rental:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
