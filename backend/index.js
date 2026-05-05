require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

connectDB();

const app = express();
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors({
  origin: ['https://reverserituals.in', 'https://www.reverserituals.in', 'http://localhost:5173']
}));

// ✅ Webhook needs RAW BODY before JSON parsing
const webhookHandler = require('./routes/orderRoutes').webhook;
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Multipart/form-data for file uploads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);

console.log('All routes loaded');

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