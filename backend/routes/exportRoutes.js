const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Video = require('../models/Video');
const Collection = require('../models/Collection');

// GET /api/export/:videoId — generate aesthetic PDF scrapbook
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.videoId });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const collections = await Collection.find({ 'clips.videoId': req.params.videoId });
    const clips = collections.flatMap(c => c.clips.filter(cl => cl.videoId === req.params.videoId)
      .map(cl => ({ ...cl.toObject(), board: c.name })));

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DeepIndex_${video.title.replace(/[^a-z0-9]/gi,'_')}.pdf"`);
    doc.pipe(res);

    const BEIGE = '#E5DED0';
    const CHARCOAL = '#4A443F';
    const SAGE = '#7B9E72';
    const BLUSH = '#E8A598';
    const HONEY = '#F2C94C';

    // ── Cover ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(BEIGE);

    // Grid pattern
    for (let x = 0; x < doc.page.width; x += 28) doc.moveTo(x,0).lineTo(x,doc.page.height).stroke('#D1C7B7').lineWidth(0.4).opacity(0.5);
    for (let y = 0; y < doc.page.height; y += 28) doc.moveTo(0,y).lineTo(doc.page.width,y).stroke('#D1C7B7').lineWidth(0.4).opacity(0.5);
    doc.opacity(1);

    // Washi tape top strip
    doc.rect(0, 0, doc.page.width, 28).fill(BLUSH).opacity(0.5);
    doc.opacity(1).font('Helvetica').fontSize(9).fillColor(CHARCOAL).text('✿ DeepIndex Scrapbook ✿', 40, 9);

    // Title
    doc.font('Helvetica-Bold').fontSize(28).fillColor(CHARCOAL).text(video.title, 40, 60, { width: 520 });
    doc.font('Helvetica').fontSize(11).fillColor(SAGE).text('📓 Research Scrapbook   🐝 Powered by DeepIndex', 40, 100);
    doc.font('Helvetica').fontSize(9).fillColor('#9E9590').text(`Generated ${new Date().toLocaleDateString('en-IN', { dateStyle:'long' })}`, 40, 118);

    // Divider
    doc.moveTo(40, 140).lineTo(555, 140).dash(6, { space: 3 }).stroke(CHARCOAL).undash();

    // Summary
    let y = 155;
    if (video.summary) {
      doc.rect(40, y, 515, 20).fill(HONEY).opacity(0.7);
      doc.opacity(1).font('Helvetica-Bold').fontSize(10).fillColor(CHARCOAL).text('✨ Vibe Check', 50, y + 5);
      y += 28;
      doc.font('Helvetica-Oblique').fontSize(11).fillColor('#5C9E9B').text(video.summary.vibeCheck || '', 50, y, { width: 500 });
      y += 32;

      doc.font('Helvetica-Bold').fontSize(9).fillColor(CHARCOAL).text('🐝 THE BUZZ', 50, y, { characterSpacing: 1.5 });
      y += 14;
      (video.summary.buzz || []).forEach(b => {
        doc.font('Helvetica').fontSize(10).fillColor(CHARCOAL).text(`• ${b}`, 55, y, { width: 490 });
        y += 18;
      });
      y += 8;

      if (video.summary.notebookEntry) {
        doc.rect(40, y - 4, 515, 2).fill('#D1C7B7');
        y += 10;
        doc.font('Courier').fontSize(9).fillColor(CHARCOAL).text(video.summary.notebookEntry, 50, y, { width: 500 });
        y += doc.heightOfString(video.summary.notebookEntry, { width: 500, font: 'Courier', fontSize: 9 }) + 16;
      }
    }

    // Pinned Clips
    if (clips.length > 0) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BEIGE);
      for (let x = 0; x < doc.page.width; x += 28) doc.moveTo(x,0).lineTo(x,doc.page.height).stroke('#D1C7B7').lineWidth(0.4).opacity(0.5);
      for (let y2 = 0; y2 < doc.page.height; y2 += 28) doc.moveTo(0,y2).lineTo(doc.page.width,y2).stroke('#D1C7B7').lineWidth(0.4).opacity(0.5);
      doc.opacity(1);

      doc.rect(0, 0, doc.page.width, 28).fill(SAGE).opacity(0.5);
      doc.opacity(1).font('Helvetica-Bold').fontSize(9).fillColor('white').text('📌 DeepPin Collection', 40, 9);

      y = 45;
      doc.font('Helvetica-Bold').fontSize(16).fillColor(CHARCOAL).text('📌 Pinned Clips', 40, y);
      y += 30;

      clips.forEach((clip, i) => {
        if (y > 700) { doc.addPage(); y = 40; }
        const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

        // Clip card
        doc.roundedRect(40, y, 515, 70, 8).fill('rgba(245,240,232,0.9)').stroke(CHARCOAL).lineWidth(1.2);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(SAGE)
          .text(`▶ ${fmt(clip.startTime)} – ${fmt(clip.endTime)}  •  Board: "${clip.board}"`, 52, y + 8);
        doc.font('Courier').fontSize(8.5).fillColor(CHARCOAL)
          .text(`"${clip.text}"`, 52, y + 22, { width: 490, height: 35, ellipsis: true });
        if (clip.score) {
          doc.font('Helvetica').fontSize(7).fillColor('#9E9590').text(`Match: ${Math.floor(clip.score*100)}%`, 52, y + 56);
        }
        y += 80;
      });
    }

    doc.end();
  } catch (e) {
    console.error('Export error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
