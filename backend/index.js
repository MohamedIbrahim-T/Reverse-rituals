require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

connectDB();

const app = express();
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors({}));

// ✅ Webhook needs RAW BODY before JSON parsing
const webhookHandler = require('./routes/orderRoutes').webhook;
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Normal JSON parsing
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Pincode Proxy
const axios = require('axios');
app.get('/api/pincode/:code', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.postalpincode.in/pincode/${req.params.code}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Pincode fetch failed' });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});