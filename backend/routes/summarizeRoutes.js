const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// Mock summarizer — produces the 3-level Notebook Summary
// Will upgrade to live GPT-4o call when/if OpenAI quota is restored
function generateMockSummary(title) {
  const titleName = title || 'this video';
  return {
    vibeCheck: `A focused, informative session on ${titleName}—like a good cup of tea with someone smart.`,
    buzz: [
      `📌 Core topic: ${titleName} covers deep, structured knowledge extraction`,
      `🔍 Key technique: Semantic segmentation enables precise timestamp search`,
      `🧠 AI Pipeline: Whisper → Pinecone → Vector similarity retrieval`,
      `🎨 Use case: Students and researchers who want to deep-dive faster`,
      `💡 Insight: Semantic search outperforms keyword search by 4x in unstructured media`,
    ],
    notebookEntry: `Upon reviewing ${titleName}, the content delivers a well-paced exploration of the subject matter. The speaker maintains a consistent thread throughout, offering actionable insights grounded in practical demonstration. Notable: the middle segment offers the densest information density, and the final third addresses common edge cases. Recommended for anyone seeking a structured overview — return to timestamp 02:12 for the key thesis.`,
  };
}

// GET /api/summarize/:videoId
router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const video = await Video.findOne({ videoId });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (video.summary && video.summary.vibeCheck) return res.json(video.summary);

    // Generate and cache
    const summary = generateMockSummary(video.title);
    await Video.findOneAndUpdate({ videoId }, { summary });
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
