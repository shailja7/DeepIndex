const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// GET /api/collections — all boards
router.get('/', async (req, res) => {
  try {
    const cols = await Collection.find().sort({ updatedAt: -1 });
    res.json(cols);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/collections — add clip to board (creates board if needed)
router.post('/', async (req, res) => {
  const { name, clip } = req.body;
  if (!name || !clip) return res.status(400).json({ error: 'name and clip required' });
  try {
    let board = await Collection.findOne({ name });
    if (!board) {
      board = new Collection({ name, clips: [clip] });
    } else {
      board.clips.push(clip);
      board.updatedAt = new Date();
    }
    await board.save();
    res.json(board);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/collections/:name — delete entire board
router.delete('/:name', async (req, res) => {
  try {
    await Collection.deleteOne({ name: req.params.name });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/collections/:name/clips/:index — delete single clip
router.delete('/:name/clips/:index', async (req, res) => {
  try {
    const board = await Collection.findOne({ name: req.params.name });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    board.clips.splice(Number(req.params.index), 1);
    board.updatedAt = new Date();
    await board.save();
    res.json(board);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
