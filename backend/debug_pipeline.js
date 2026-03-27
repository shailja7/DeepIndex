const { processVideo } = require('./services/videoProcessor');
const Video = require('./models/Video');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function debugPipeline() {
  console.log('--- 🐝 Pipeline Debugger ---');
  
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // Create a dummy file for testing if none exists
    const testFile = path.join(__dirname, 'uploads', 'debug_test.txt');
    if (!fs.existsSync(path.dirname(testFile))) fs.mkdirSync(path.dirname(testFile));
    fs.writeFileSync(testFile, 'This is a test file for the pipeline debugger.');
    
    console.log('2. Starting processVideo for test id...');
    const videoId = 'debug-' + Date.now();
    
    // Create DB entry
    await Video.create({
      videoId,
      title: 'Debug Test',
      originalName: 'debug_test.txt',
      filename: 'debug_test.txt',
      status: 'processing'
    });

    try {
      await processVideo(testFile, videoId);
      console.log('✅ processVideo completed successfully.');
      await Video.findOneAndUpdate({ videoId }, { status: 'completed' });
    } catch (err) {
      console.error('❌ processVideo FAILED:', err.message);
      await Video.findOneAndUpdate({ videoId }, { status: 'failed' });
    }

    const result = await Video.findOne({ videoId });
    console.log(`Final Status in DB: ${result.status}`);

  } catch (err) {
    console.error('Fatal Debug Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugPipeline();
