const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.id,
        r.rental_id,
        r.base_cost,
        r.late_fee,
        r.final_total,
        r.is_voided,
        rt.customer_id,
        rt.start_date,
        rt.end_date,
        v.brand,
        v.model,
        v.vehicle_number,
        u.username AS customer_name
      FROM receipts r
      LEFT JOIN rentals rt ON r.rental_id = rt.id
      LEFT JOIN vehicles v ON rt.vehicle_id = v.id
      LEFT JOIN customers c ON rt.customer_id = c.id
      LEFT JOIN users u ON c.id = u.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:rentalId', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM receipts WHERE rental_id=?', [req.params.rentalId]
  );
  res.json(rows[0]);
});

router.put('/:id/late-fee', async (req, res) => {
  const amount = Number(req.body.amount ?? req.body.late_fee ?? 0);
  if (Number.isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Invalid late fee amount' });
  }

  const [receipt] = await db.query('SELECT * FROM receipts WHERE id=?', [req.params.id]);
  if (!receipt.length) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  const final = Number(receipt[0].base_cost || 0) + amount;
  await db.query(
    'UPDATE receipts SET late_fee=?, final_total=? WHERE id=?',
    [amount, final, req.params.id]
  );
  res.json({ message: 'Late fee applied' });
});

const markReceiptVoided = async (req, res) => {
  const [result] = await db.query(
    'UPDATE receipts SET is_voided = true WHERE id=?',
    [req.params.id]
  );
  if (!result.affectedRows) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  res.json({ message: 'Receipt voided' });
};

router.put('/:id/void', markReceiptVoided);
router.patch('/:id/void', markReceiptVoided);
router.post('/:id/void', markReceiptVoided);
router.put('/void/:id', markReceiptVoided);
router.patch('/void/:id', markReceiptVoided);
router.post('/void/:id', markReceiptVoided);

module.exports = router;
