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
// Middleware
let allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://deep-index.vercel.app'];

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''));
  allowedOrigins = [...new Set([...allowedOrigins, ...envOrigins])];
}

app.use(cors({
  origin: (origin, callback) => {
    // Check if origin is allowed (or if there's no origin, like REST tools)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected Origin: ${origin}`);
      // Fallback for Vercel preview branches or unexpected domains during debugging
      if (origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Fallback for when Render wipes the ephemeral disk
app.use('/uploads/:filename', (req, res) => {
  console.log(`[Storage] File missing on disk: ${req.params.filename}. Serving fallback video.`);
  // Redirect to a stable, beautiful, open-source video so the player doesn't crash for recruiters.
  // Using an external URL ensures it never disappears, even across backend restarts.
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
});


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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
