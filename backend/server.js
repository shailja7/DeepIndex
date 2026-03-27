const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const videoRoutes = require('./routes/videoRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const summarizeRoutes = require('./routes/summarizeRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', videoRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/summarize', summarizeRoutes);
app.use('/api/export', exportRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('🌿 DeepIndex API is running!');
});

// Database Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server started on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
