const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const Video = require('../models/Video');
const { processVideo, searchVideo } = require('../services/videoProcessor');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    const isVideo = file.originalname.match(/\.(mp4|mov|mkv|avi)$/i) || file.mimetype.startsWith('video/');
    const isAudio = file.originalname.match(/\.(mp3|wav|m4a|aac)$/i) || file.mimetype.startsWith('audio/');
    
    if (isVideo || isAudio) {
      cb(null, true);
    } else {
      cb(new Error('Only Video and Audio files are allowed'), false);
    }
  },
});

// @route   POST /api/upload
// @desc    Upload a video and start processing
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      console.warn('[Upload] No file provided in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log(`[Upload] Received file: ${req.file.originalname} (${req.file.size} bytes)`);

    const videoId = uuidv4();
    const newVideo = new Video({
      videoId,
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      status: 'processing',
    });

    await newVideo.save();

    // Start background processing
    processVideo(req.file.path, videoId)
      .then(async () => {
        await Video.findOneAndUpdate({ videoId }, { status: 'completed' });
      })
      .catch(async (err) => {
        console.error('Processing failed:', err);
        await Video.findOneAndUpdate({ videoId }, { status: 'failed' });
      });

    res.status(202).json({
      message: 'Video upload started! Processing in background...',
      videoId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/search
// @desc    Search for moments in a video
router.get('/search', async (req, res) => {
  const { query, videoId } = req.query;
  if (!query) return res.status(400).json({ error: 'Search query is required' });
  try {
    const results = await searchVideo(query, videoId, 5);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
});


// @route   GET /api/videos
// @desc    Get all videos
router.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ uploadDate: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
