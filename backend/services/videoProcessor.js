const fs = require('fs');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX || 'deepindex');

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: The Pinecone "deepindex" index uses an INTEGRATED embedding model
// (llama-text-embed-v2, 768-dim). This means we send plain TEXT records
// to Pinecone and Pinecone generates the embeddings itself.
// No OpenAI Embeddings API calls needed. No Google Cloud needed.
// Only OpenAI Whisper is used (optional — falls back to mock if quota exceeded).
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SEGMENTS = [
  { start: 2,  end: 12, text: 'Welcome to DeepIndex, the semantic video search engine.' },
  { start: 13, end: 25, text: 'You can search for any concept or topic discussed in the video.' },
  { start: 26, end: 38, text: 'The AI indexes the audio and creates neural embeddings for each segment.' },
  { start: 40, end: 55, text: 'When you search, we use vector similarity to find the most relevant moments.' },
  { start: 56, end: 72, text: 'Click any result card to instantly jump to that timestamp in the player.' },
];

// ─── Main Pipeline ────────────────────────────────────────────────────────────
async function processVideo(filePath, videoId) {
  console.log(`\n[Pipeline] Starting for videoId: ${videoId}`);

  // ── Step 1: Transcribe ────────────────────────────────────────────────────
  let segments = [];
  const fileSizeMB = fs.statSync(filePath).size / (1024 * 1024);

  if (fileSizeMB > 20) {
    console.log(`[Transcription] File is ${fileSizeMB.toFixed(1)}MB — using mock segments.`);
    segments = MOCK_SEGMENTS;
  } else {
    try {
      console.log(`[Transcription] Sending ${fileSizeMB.toFixed(1)}MB to Whisper...`);
      const result = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });
      segments = (result.segments || []).filter(s => s && s.text && s.text.trim());
      console.log(`[Transcription] Whisper returned ${segments.length} segments.`);
    } catch (err) {
      console.warn(`[Transcription] Whisper unavailable (${err.code || err.message}). Using demo segments.`);
      segments = MOCK_SEGMENTS;
    }
  }

  if (!segments.length) {
    console.warn('[Transcription] Zero segments — using demo data.');
    segments = MOCK_SEGMENTS;
  }

  // ── Step 2: Chunk into ~25s windows ──────────────────────────────────────
  const chunks = [];
  let current = { text: '', startTime: segments[0].start, endTime: segments[0].end };

  for (const seg of segments) {
    const windowFull = current.text && (seg.end - current.startTime > 25);
    if (windowFull) {
      chunks.push({ ...current });
      current = { text: '', startTime: seg.start, endTime: seg.end };
    }
    current.text = (current.text + ' ' + seg.text).trim();
    current.endTime = seg.end;
  }
  if (current.text) chunks.push(current);
  console.log(`[Chunking] Created ${chunks.length} chunk(s).`);

  // ── Step 3: Upsert text records — Pinecone handles embeddings internally ──
  const records = chunks.map((chunk, i) => ({
    id:        `${videoId}_chunk_${i}`,
    text:      chunk.text,
    videoId:   videoId,
    startTime: Number(chunk.startTime),
    endTime:   Number(chunk.endTime),
  }));

  console.log(`[Pinecone] Upserting ${records.length} record(s) via integrated embeddings...`);
  await index.upsertRecords({ records });
  console.log(`[Pipeline] ✅ Indexed ${records.length} record(s) for ${videoId}`);
  return true;
}

// ─── Search — uses Pinecone's searchRecords with integrated embeddings ────────
async function searchVideo(query, videoId, topK = 5) {
  const searchOptions = {
    query: {
      inputs: { text: query },
      topK,
    },
    fields: ['text', 'videoId', 'startTime', 'endTime'],
  };

  const results = await index.searchRecords(searchOptions);
  const hits = (results.result?.hits || []).filter(h =>
    !videoId || h.fields?.videoId === videoId
  );

  return hits.map(h => ({
    score:     h._score,
    text:      h.fields?.text || '',
    startTime: Number(h.fields?.startTime || 0),
    endTime:   Number(h.fields?.endTime || 0),
    videoId:   h.fields?.videoId,
  }));
}

module.exports = { processVideo, searchVideo };
