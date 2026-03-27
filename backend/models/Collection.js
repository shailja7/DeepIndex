const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  videoId: String,
  videoTitle: String,
  text: String,
  startTime: Number,
  endTime: Number,
  score: Number,
  pinnedAt: { type: Date, default: Date.now },
});

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // board name
  clips: [clipSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Unique by name
collectionSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
