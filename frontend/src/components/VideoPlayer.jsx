import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowLeft, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DaisySVG = ({ size = 18, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {[0,40,80,120,160,200,240,280,320].map((deg, i) => (
      <ellipse key={i} cx="12" cy="12" rx="2" ry="4.5"
        fill={filled ? '#F2C94C' : '#F5F0E8'} stroke="#4A443F" strokeWidth="1"
        transform={`rotate(${deg} 12 12) translate(0 -5.5)`}/>
    ))}
    <circle cx="12" cy="12" r="4" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.2"/>
  </svg>
);

const PinSVG = ({ pinned }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={pinned ? '#E8A598' : 'none'} stroke="#4A443F" strokeWidth="1.5">
    <path d="M12 2a5 5 0 0 1 5 5c0 3.5-5 11-5 11S7 10.5 7 7a5 5 0 0 1 5-5Z"/>
    <circle cx="12" cy="7.5" r="2" fill="#4A443F"/>
  </svg>
);

function VideoPlayer({ video, onBack, collections, onCollectionUpdate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);
  const [showPin, setShowPin] = useState(null); // result index
  const [pinName, setPinName] = useState('');
  const [pinSuccess, setPinSuccess] = useState(null);
  const videoRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/search`, {
        params: { query, videoId: video.videoId }
      });
      setResults(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const jumpTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const update = () => setProgress((vid.currentTime / vid.duration) * 100 || 0);
    vid.addEventListener('timeupdate', update);
    return () => vid.removeEventListener('timeupdate', update);
  }, []);

  const handlePin = async (result) => {
    if (!pinName.trim()) return;
    try {
      await axios.post(`${API_BASE}/collections`, {
        name: pinName,
        clip: {
          videoId: video.videoId,
          videoTitle: video.title,
          text: result.text,
          startTime: result.startTime,
          endTime: result.endTime,
          score: result.score,
        }
      });
      onCollectionUpdate();
      setShowPin(null);
      setPinName('');
      setPinSuccess(result.startTime);
      setTimeout(() => setPinSuccess(null), 2000);
    } catch (err) { console.error(err); }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/summarize/${video.videoId}`);
      setSummary(res.data);
    } catch (err) { console.error(err); }
  };

  const duration = videoRef.current?.duration || 0;
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        display:'flex', alignItems:'center', gap:'0.5rem',
        background:'none', border:'none', cursor:'pointer',
        fontFamily:"'Quicksand',sans-serif", fontWeight:600,
        color:'#7B9E72', marginBottom:'1rem', padding:0, fontSize:'0.9rem'
      }}>
        <ArrowLeft size={16}/> Back to Nook
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'1.5rem', alignItems:'start' }}>

        {/* ─── Left: Video Player ─────────────────────────── */}
        <div>
          {/* Title Strip */}
          <div className="washi-blue" style={{ marginBottom:'-2px', borderRadius:'8px 8px 0 0', padding:'3px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span className="font-handwritten" style={{ fontSize:'1rem', color:'#3D3731' }}>🎬 {video.title}</span>
            <a href={`${API_BASE}/export/${video.videoId}`} target="_blank" rel="noreferrer">
              <button style={{ background:'none', border:'none', cursor:'pointer', color:'#3D3731' }} title="Download Scrapbook">
                <Download size={16}/>
              </button>
            </a>
          </div>

          {/* Player Box */}
          <div className="hand-drawn" onClick={togglePlay} style={{
            background:'#1a1a2e', cursor:'pointer', position:'relative',
            borderRadius:'0 0 12px 12px', overflow:'hidden', minHeight:'200px',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <video
              ref={videoRef}
              src={`${API_BASE.replace('/api','')}/uploads/${video.filename}`}
              style={{ width:'100%', display:'block' }}
              controls={false}
            />
            {/* play overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}
                  style={{
                    position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(0,0,0,0.35)', backdropFilter:'blur(2px)'
                  }}
                >
                  <div style={{
                    width:'56px', height:'56px', borderRadius:'50%',
                    background:'rgba(245,240,232,0.9)', border:'1.5px solid #4A443F',
                    boxShadow:'2px 2px 0 #4A443F', display:'flex', alignItems:'center', justifyContent:'center'
                  }}>
                    <Play size={22} fill="#4A443F" color="#4A443F"/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Daisy Timeline ── */}
          <div className="hand-drawn-sm" style={{ background:'rgba(245,240,232,0.9)', padding:'0.75rem 1rem', marginTop:'0.75rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
              <button onClick={togglePlay} style={{ background:'none', border:'none', cursor:'pointer', color:'#3D3731', padding:0 }}>
                {isPlaying ? <Pause size={18}/> : <Play size={18} fill="#3D3731"/>}
              </button>
              <span style={{ fontFamily:"'Courier New',monospace", fontSize:'0.8rem', color:'#7B9E72' }}>
                {fmt(videoRef.current?.currentTime || 0)} / {fmt(duration)}
              </span>
            </div>

            {/* Timeline track */}
            <div
              style={{ position:'relative', height:'28px', cursor:'pointer' }}
              onClick={(e) => {
                if (!videoRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
              }}
            >
              {/* Base track */}
              <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'3px', background:'#D1C7B7', transform:'translateY(-50%)', borderRadius:'2px' }}/>
              {/* Progress */}
              <div style={{ position:'absolute', top:'50%', left:0, height:'3px', width:`${progress}%`, background:'#7B9E72', transform:'translateY(-50%)', borderRadius:'2px', transition:'width 0.3s linear' }}/>
              {/* Search result daisy markers */}
              {results.map((r, i) => (
                <div key={i} style={{
                  position:'absolute', top:'50%', transform:'translate(-50%,-50%)',
                  left: duration ? `${(r.startTime / duration) * 100}%` : '0%',
                  cursor:'pointer', zIndex:5
                }} onClick={(e) => { e.stopPropagation(); jumpTo(r.startTime); }}>
                  <DaisySVG size={20} filled/>
                </div>
              ))}
            </div>
          </div>

          {/* ── Notebook Summary ── */}
          {!summary ? (
            <button onClick={fetchSummary} className="btn-cottage-pink" style={{ marginTop:'0.75rem', fontSize:'0.8rem' }}>
              📓 Open Notebook Summary
            </button>
          ) : (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{ marginTop:'1rem', position:'relative' }}>
              <div className="washi-yellow" style={{ padding:'3px 12px', marginBottom:'-4px', borderRadius:'4px 4px 0 0', display:'inline-block' }}>
                <span style={{ fontFamily:"'Caveat',cursive", fontSize:'0.85rem', color:'#3D3731' }}>📓 Research Notes</span>
              </div>
              <div className="torn-paper" style={{ paddingBottom:'1.5rem' }}>
                {summary.vibeCheck && (
                  <p className="font-handwritten" style={{ color:'#5C9E9B', fontSize:'1.1rem', marginBottom:'0.75rem', fontStyle:'italic' }}>
                    ✨ Vibe: {summary.vibeCheck}
                  </p>
                )}
                <p className="font-rounded" style={{ fontSize:'0.75rem', color:'#7B9E72', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>
                  🐝 The Buzz
                </p>
                <div className="notebook-lines" style={{ color:'#3D3731', fontSize:'0.88rem' }}>
                  {summary.buzz?.map((b, i) => <p key={i} style={{ margin:'0.3rem 0' }}>• {b}</p>)}
                </div>
                {summary.notebookEntry && (
                  <p className="font-typewriter" style={{ marginTop:'1rem', color:'#4A443F', fontSize:'0.8rem', lineHeight:1.8, borderTop:'1px dashed #D1C7B7', paddingTop:'0.75rem' }}>
                    {summary.notebookEntry}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Right: Search Intelligence Panel ──────────── */}
        <div style={{ position:'sticky', top:'80px' }}>
          <div className="section-header">🔍 Ask the Video</div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ marginBottom:'1rem', position:'relative' }}>
            <input
              type="text"
              placeholder="Buzz your query... 🐝"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="stitched font-rounded"
              style={{
                width:'100%', padding:'0.75rem 3rem 0.75rem 1rem',
                fontSize:'0.95rem', color:'#3D3731', display:'block',
                animation: loading ? 'none' : 'pulse-border 2s infinite'
              }}
            />
            <button type="submit" style={{
              position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', padding:0
            }}>
              <DaisySVG size={24} filled={!!query}/>
            </button>
          </form>

          {/* AI Thinking Animation */}
          {loading && (
            <div style={{ display:'flex', gap:'6px', justifyContent:'center', padding:'1rem', color:'#7B9E72' }}>
              {[0,0.15,0.3].map((d, i) => (
                <motion.div key={i} animate={{ y:[0,-8,0] }} transition={{ repeat:Infinity, duration:0.5, delay:d }}
                  style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#7B9E72', border:'1px solid #4A443F' }}
                />
              ))}
            </div>
          )}

          {/* Results */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', maxHeight:'calc(100vh - 320px)', overflowY:'auto' }}>
            <AnimatePresence>
              {results.map((r, i) => {
                // Keyword highlight
                const lcQuery = query.toLowerCase().split(' ')[0];
                const idx = r.text.toLowerCase().indexOf(lcQuery);
                let textEl = <>{r.text}</>;
                if (idx >= 0 && lcQuery.length > 1) {
                  textEl = <>
                    {r.text.slice(0, idx)}
                    <mark style={{ background:'rgba(242,201,76,0.5)', borderRadius:'2px', padding:'0 2px' }}>
                      {r.text.slice(idx, idx + lcQuery.length)}
                    </mark>
                    {r.text.slice(idx + lcQuery.length)}
                  </>;
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity:0, x:15, rotate:2 }}
                    animate={{ opacity:1, x:0, rotate:0 }}
                    exit={{ opacity:0, x:-15 }}
                    transition={{ delay: i * 0.06 }}
                    className="sticker-card"
                    style={{ padding:'0.9rem' }}
                  >
                    {/* Timestamp + Pin */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                      <button
                        onClick={() => jumpTo(r.startTime)}
                        style={{
                          background:'#7B9E72', color:'white', border:'1.5px solid #4A443F',
                          borderRadius:'12px', padding:'2px 8px', fontSize:'0.7rem',
                          fontFamily:"'Courier New',monospace", fontWeight:700,
                          cursor:'pointer', boxShadow:'1px 1px 0 #4A443F'
                        }}
                      >
                        ▶ {fmt(r.startTime)} – {fmt(r.endTime)}
                      </button>
                      <button
                        onClick={() => setShowPin(showPin === i ? null : i)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}
                        title="DeepPin this clip"
                      >
                        <PinSVG pinned={pinSuccess === r.startTime} />
                      </button>
                    </div>

                    {/* Transcript snippet */}
                    <p className="font-typewriter" style={{ fontSize:'0.8rem', color:'#3D3731', lineHeight:1.7, margin:'0 0 0.5rem' }}>
                      "{textEl}"
                    </p>

                    {/* Match score bar */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'0.65rem', color:'#9E9590', fontWeight:600, width:'36px' }}>Match</span>
                      <div style={{ flex:1, height:'5px', background:'#E5DED0', borderRadius:'3px', border:'1px solid #D1C7B7', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.floor(r.score*100)}%`, background:'linear-gradient(90deg,#E8A598,#7B9E72)', borderRadius:'3px' }}/>
                      </div>
                      <span style={{ fontSize:'0.7rem', fontFamily:"'Courier New'", color:'#7B9E72', fontWeight:700 }}>{Math.floor(r.score*100)}%</span>
                    </div>

                    {/* DeepPin popup */}
                    <AnimatePresence>
                      {showPin === i && (
                        <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:5}}
                          style={{ marginTop:'0.75rem', padding:'0.75rem', background:'rgba(242,201,76,0.15)', borderRadius:'8px', border:'1px dashed #F2C94C' }}
                        >
                          <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#3D3731', margin:'0 0 0.5rem' }}>📌 Save to Board</p>
                          <div style={{ display:'flex', gap:'0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Board name..."
                              value={pinName}
                              onChange={e => setPinName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handlePin(r)}
                              className="stitched font-rounded"
                              style={{ flex:1, padding:'4px 8px', fontSize:'0.8rem', color:'#3D3731' }}
                            />
                            <button onClick={() => handlePin(r)} className="btn-cottage-pink" style={{ fontSize:'0.75rem', padding:'4px 10px' }}>
                              Pin 🌼
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty states */}
            {!loading && results.length === 0 && query && (
              <div style={{ textAlign:'center', padding:'2rem', color:'#9E9590', fontFamily:"'Caveat',cursive", fontSize:'1.1rem' }}>
                No petals found for that query 🌼
              </div>
            )}
            {!loading && results.length === 0 && !query && (
              <div style={{ textAlign:'center', padding:'2rem', color:'#9E9590', fontFamily:"'Caveat',cursive", fontSize:'1rem' }}>
                Ask the video anything — the bees are listening 🐝
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
