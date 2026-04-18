require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// CORS configuration - FIXED
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'https://findy-five.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const workerRoutes = require('./routes/workerRoutes');
const aroundRoutes = require('./routes/aroundRoutes');

// Use Routes
app.use('/api/user', userRoutes);
app.use('/api/listing', listingRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/around', aroundRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Findy API is running!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });