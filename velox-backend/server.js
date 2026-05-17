const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/rentals',  require('./routes/rentals'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/users',    require('./routes/users'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
