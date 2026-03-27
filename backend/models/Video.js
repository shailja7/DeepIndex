const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  summary: {
    vibeCheck: String,
    buzz: [String],
    notebookEntry: String,
  },
  duration: {
    type: Number, // in seconds
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading',
  },
});

module.exports = mongoose.model('Video', VideoSchema);
