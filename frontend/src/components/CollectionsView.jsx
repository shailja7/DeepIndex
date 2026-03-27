import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const PinSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E8A598" stroke="#4A443F" strokeWidth="1.5">
    <path d="M12 2a5 5 0 0 1 5 5c0 3.5-5 11-5 11S7 10.5 7 7a5 5 0 0 1 5-5Z"/>
    <circle cx="12" cy="7.5" r="2" fill="#4A443F"/>
  </svg>
);

function CollectionsView({ collections, onUpdate, onVideoSelect, videos }) {
  const [expanded, setExpanded] = useState(null);

  const deleteClip = async (boardName, clipIndex) => {
    try {
      await axios.delete(`${API_BASE}/collections/${encodeURIComponent(boardName)}/clips/${clipIndex}`);
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const deleteBoard = async (boardName) => {
    try {
      await axios.delete(`${API_BASE}/collections/${encodeURIComponent(boardName)}`);
      onUpdate();
      if (expanded === boardName) setExpanded(null);
    } catch (e) { console.error(e); }
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ maxWidth:'960px', margin:'0 auto' }}>
      <div className="section-header">📌 DeepPin Collections</div>

      {collections.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'#9E9590', fontFamily:"'Caveat',cursive", fontSize:'1.3rem' }}>
          No boards yet! Pin a clip from the search view to get started 🌼
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.25rem' }}>
          {collections.map((board, bi) => (
            <motion.div
              key={board.name}
              className="sticker-card"
              style={{ padding:0, overflow:'hidden' }}
              whileHover={{ rotate: 0.8, y: -3 }}
            >
              {/* Board Header (washi tape) */}
              <div style={{
                background:'rgba(232,165,152,0.35)', borderBottom:'1.5px solid #4A443F',
                padding:'0.6rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <PinSVG/>
                  <span className="font-handwritten" style={{ fontSize:'1.1rem', color:'#3D3731', fontWeight:600 }}>
                    {board.name}
                  </span>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.7rem', color:'#7B9E72', fontWeight:700, background:'rgba(123,158,114,0.15)', borderRadius:'10px', padding:'1px 6px' }}>
                    {board.clips.length} clips
                  </span>
                  <button
                    onClick={() => deleteBoard(board.name)}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.9rem', padding:0 }}
                    title="Delete board"
                  >🗑</button>
                </div>
              </div>

              {/* Clips list */}
              <div style={{ padding:'0.75rem 1rem' }}>
                {board.clips.slice(0, expanded === board.name ? undefined : 2).map((clip, ci) => (
                  <div key={ci} style={{
                    marginBottom:'0.6rem', background:'rgba(245,240,232,0.7)',
                    borderRadius:'8px', border:'1px dashed #D1C7B7', padding:'0.5rem 0.6rem',
                    position:'relative'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                      <span style={{
                        fontSize:'0.65rem', fontFamily:"'Courier New'", color:'white',
                        background:'#5C9E9B', padding:'1px 6px', borderRadius:'8px',
                        border:'1px solid #4A443F'
                      }}>
                        {clip.videoTitle?.substring(0,14)}... ▶ {fmt(clip.startTime)}
                      </span>
                      <button
                        onClick={() => deleteClip(board.name, ci)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', padding:0 }}
                      >✕</button>
                    </div>
                    <p className="font-typewriter" style={{ fontSize:'0.75rem', color:'#3D3731', margin:0, lineHeight:1.5, 
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      "{clip.text}"
                    </p>
                  </div>
                ))}

                {board.clips.length > 2 && (
                  <button
                    onClick={() => setExpanded(expanded === board.name ? null : board.name)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#7B9E72',
                      fontFamily:"'Caveat',cursive", fontSize:'0.9rem', padding:0 }}
                  >
                    {expanded === board.name ? '▲ Show less' : `+ ${board.clips.length - 2} more clips`}
                  </button>
                )}

                {board.clips.length === 0 && (
                  <p style={{ color:'#9E9590', fontSize:'0.8rem', fontStyle:'italic' }}>Empty board</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectionsView;
