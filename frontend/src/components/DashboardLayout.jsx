import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/* ─── SVGs ──────────────────────────────────────────────── */
const BeeSVG = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <ellipse cx="16" cy="19" rx="7" ry="5.5" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.5"/>
    <rect x="11" y="17" width="10" height="2.5" rx="1.2" fill="#4A443F" opacity="0.45"/>
    <rect x="11" y="20.5" width="10" height="2" rx="1" fill="#4A443F" opacity="0.35"/>
    <ellipse cx="16" cy="13" rx="4.5" ry="3.5" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.5"/>
    <ellipse cx="10.5" cy="11.5" rx="5" ry="2.8" fill="rgba(92,158,155,0.55)" stroke="#4A443F" strokeWidth="1" transform="rotate(-25 10.5 11.5)"/>
    <ellipse cx="21.5" cy="11.5" rx="5" ry="2.8" fill="rgba(92,158,155,0.55)" stroke="#4A443F" strokeWidth="1" transform="rotate(25 21.5 11.5)"/>
    <circle cx="14.5" cy="12.5" r="0.8" fill="#4A443F"/>
    <circle cx="17.5" cy="12.5" r="0.8" fill="#4A443F"/>
  </svg>
);

const DaisySVG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {[0,40,80,120,160,200,240,280,320].map((deg, i) => (
      <ellipse key={i} cx="12" cy="12" rx="2" ry="4.5"
        fill="#F5F0E8" stroke="#4A443F" strokeWidth="1"
        transform={`rotate(${deg} 12 12) translate(0 -5.5)`}/>
    ))}
    <circle cx="12" cy="12" r="4" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.2"/>
  </svg>
);

/* ─── Bee Progress Bar ──────────────────────────────────── */
function BeeProgressBar({ progress, label }) {
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
        <span style={{ fontFamily:"'Caveat',cursive", fontSize:'1rem', color:'#3D3731' }}>{label}</span>
        <span style={{ fontFamily:"'Courier New',monospace", fontSize:'0.8rem', color:'#7B9E72', fontWeight:700 }}>{Math.floor(progress)}%</span>
      </div>
      <div style={{ position:'relative', height:'36px' }}>
        {/* Dotted flight path */}
        <div style={{
          position:'absolute', top:'50%', left:0, right:0, height:'2px',
          borderTop:'2px dashed #D1C7B7', transform:'translateY(-50%)'
        }}/>
        {/* Progress fill */}
        <div style={{
          position:'absolute', top:'50%', left:0, height:'3px',
          width:`${progress}%`, background:'linear-gradient(90deg,#7B9E72,#5C9E9B)',
          transform:'translateY(-50%)', borderRadius:'2px', transition:'width 0.4s ease'
        }}/>
        {/* Daisy markers at 25, 50, 75, 100% */}
        {[25,50,75,100].map(pct => (
          <div key={pct} style={{
            position:'absolute', top:'50%', left:`${pct}%`,
            transform:'translate(-50%,-50%)',
            opacity: progress >= pct ? 1 : 0.25
          }}>
            <DaisySVG size={18} />
          </div>
        ))}
        {/* Flying Bee */}
        <motion.div
          animate={{ x: `${Math.min(progress, 98)}%`, y: [0, -4, 0, -3, 0] }}
          transition={{ x: { duration:0.4, ease:'easeOut' }, y: { repeat:Infinity, duration:0.5 } }}
          style={{ position:'absolute', top:'50%', left:0, transform:'translateY(-50%)' }}
        >
          <BeeSVG size={28} />
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Summarizer Panel ──────────────────────────────────── */
function SummaryPanel({ videoId, title }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/summarize/${videoId}`);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  if (!summary && !loading) return (
    <button onClick={fetchSummary} className="btn-cottage-pink" style={{ fontSize:'0.8rem', marginTop:'0.5rem' }}>
      🌸 Generate Notebook Summary
    </button>
  );

  if (loading) return (
    <div style={{ textAlign:'center', color:'#7B9E72', fontFamily:"'Caveat',cursive", marginTop:'0.5rem' }}>
      🐝 Buzzing through transcripts…
    </div>
  );

  return (
    <div style={{ marginTop:'0.75rem' }}>
      {/* Washi tape header */}
      <div className="washi-yellow" style={{ marginBottom:'-4px', borderRadius:'4px', padding:'2px 12px' }}>
        <span style={{ fontFamily:"'Caveat',cursive", fontSize:'0.85rem', color:'#3D3731' }}>📓 Notebook</span>
      </div>
      <div className="torn-paper notebook-lines" style={{ fontSize:'0.85rem', color:'#3D3731' }}>
        {summary?.vibeCheck && (
          <p style={{ marginBottom:'0.5rem', fontStyle:'italic', color:'#5C9E9B', fontFamily:"'Caveat',cursive", fontSize:'1rem' }}>
            ✨ {summary.vibeCheck}
          </p>
        )}
        {summary?.buzz?.map((b, i) => (
          <p key={i} style={{ margin:'0.2rem 0' }}>🐝 {b}</p>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
const DashboardLayout = ({ onVideoSelect, videos, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(10);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name.replace(/\.[^.]+$/, ''));

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(10 + (e.loaded / e.total) * 40);
        },
      });

      setStatus('indexing');
      setProgress(55);
      const videoId = res.data.videoId;

      const poll = setInterval(async () => {
        const check = await axios.get(`${API_BASE}/videos`);
        const vid = check.data.find(v => v.videoId === videoId);
        if (vid?.status === 'completed') {
          clearInterval(poll);
          setStatus('done');
          setProgress(100);
          onRefresh();
          setTimeout(() => { setStatus('idle'); setProgress(0); setFile(null); }, 4000);
        } else if (vid?.status === 'failed') {
          clearInterval(poll);
          setStatus('error');
        } else {
          setProgress(p => Math.min(p + 3, 95));
        }
      }, 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  const completedVideos = videos.filter(v => v.status === 'completed');
  const processingVideos = videos.filter(v => v.status === 'processing');
  const failedVideos = videos.filter(v => v.status === 'failed');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Welcome Banner ──────────────────── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h1 className="font-handwritten" style={{ fontSize:'2.8rem', color:'#3D3731', margin:0 }}>
            Welcome to your Research Nook 🌿
          </h1>
          <p style={{ color:'#7B9E72', marginTop:'0.5rem', fontSize:'1rem' }}>
            Drop a video below — the bees will do the rest.
          </p>
        </div>
      </motion.div>

      {/* ── Upload Zone ─────────────────────── */}
      <motion.div
        initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
        className="hand-drawn"
        style={{ background: 'rgba(245,240,232,0.9)', padding:'2rem', marginBottom:'2.5rem' }}
      >
        <div className="section-header" style={{ marginBottom:'1.25rem' }}>🐝 Intelligence Ingestor</div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={(e) => { e.preventDefault(); setIsHovering(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
          onClick={() => status === 'idle' && !file && fileInputRef.current.click()}
          className="stitched"
          style={{
            padding: '2rem',
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            borderColor: isHovering ? '#5C9E9B' : '#4A443F',
            background: isHovering ? 'rgba(92,158,155,0.08)' : 'rgba(245,240,232,0.6)',
            transition: 'all 0.2s ease',
          }}
        >
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <BeeSVG size={56} />
                <p className="font-handwritten" style={{ fontSize:'1.3rem', marginTop:'0.5rem', color:'#3D3731' }}>
                  {isHovering ? "Drop it like it's honey 🍯" : 'Drag & drop video or audio'}
                </p>
                <p style={{ fontSize:'0.8rem', color:'#9E9590', marginTop:'0.25rem' }}>Any size MP4, MP3, WAV — bees can handle it!</p>
              </motion.div>
            ) : (
              <motion.div key="file" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{ display:'flex', flexDirection:'column', gap:'1rem', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#5C9E9B' }}>
                  <CheckCircle size={20}/>
                  <span className="font-handwritten" style={{ fontSize:'1.1rem' }}>{file.name}</span>
                </div>

                <input
                  type="text"
                  placeholder="Give it a sweet name 🌸"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="stitched font-rounded"
                  style={{ width:'100%', padding:'0.6rem 1rem', fontSize:'0.95rem', color:'#3D3731' }}
                  disabled={status !== 'idle' && status !== 'error'}
                />

                {(status === 'idle' || status === 'error') ? (
                  <button onClick={handleUpload} className="btn-cottage" style={{ fontSize:'1rem', padding:'0.65rem 2rem' }}>
                    {status === 'error' ? '🌼 Try Again' : '🐝 Commence Ingestion'}
                  </button>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*,audio/*" style={{ display:'none' }}/>

        {/* Bee Progress */}
        {(status === 'uploading' || status === 'indexing' || status === 'done') && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{ marginTop:'1.5rem' }}>
            <BeeProgressBar
              progress={progress}
              label={status === 'uploading' ? '📡 Uplinking...' : status === 'indexing' ? '🧠 Extracting semantics...' : '✅ Done! The bee landed.'}
            />
          </motion.div>
        )}
      </motion.div>

      {/* ── Video Library Grid ──────────────── */}
      <div>
        <div className="section-header">📚 Research Library ({completedVideos.length} indexed)</div>

        {completedVideos.length === 0 && processingVideos.length === 0 ? (
          <div style={{ textAlign:'center', color:'#9E9590', padding:'2rem', fontFamily:"'Caveat',cursive", fontSize:'1.2rem' }}>
            No videos yet — feed the bees something!
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
            {[...processingVideos, ...completedVideos].map(video => (
              <motion.div
                key={video.videoId}
                whileHover={video.status === 'completed' ? { rotate: 1, y: -4 } : {}}
                className="sticker-card"
                onClick={() => video.status === 'completed' && onVideoSelect(video)}
                style={{ padding:'1.25rem', opacity: video.status === 'completed' ? 1 : 0.75 }}
              >
                {/* Washi tape strip at top */}
                <div className="washi-pink" style={{ margin:'-1.25rem -1.25rem 0.75rem', borderRadius:'10px 10px 0 0', padding:'2px 12px' }}>
                  <span style={{ fontSize:'0.65rem', color:'#3D3731', fontWeight:600 }}>
                    {video.status === 'processing' ? '🐝 indexing...' : '✅ ready'}
                  </span>
                </div>

                <h3 className="font-rounded" style={{ fontSize:'0.95rem', margin:'0 0 0.5rem', color:'#3D3731', fontWeight:700 }}>
                  {video.title}
                </h3>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.7rem', color:'#9E9590', fontFamily:"'Courier New'" }}>
                    {video.videoId.substring(0,8)}...
                  </span>
                  {video.status === 'completed' && (
                    <div style={{ background:'#7B9E72', borderRadius:'50%', padding:'5px', border:'1.5px solid #4A443F', boxShadow:'1px 1px 0 #4A443F' }}>
                      <Play size={12} fill="white" color="white"/>
                    </div>
                  )}
                </div>

                {video.status === 'completed' && (
                  <SummaryPanel videoId={video.videoId} title={video.title} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {failedVideos.length > 0 && (
          <div style={{ marginTop:'1rem', padding:'0.75rem', background:'rgba(232,165,152,0.15)', borderRadius:'10px', border:'1px dashed #E8A598' }}>
            <p style={{ fontSize:'0.8rem', color:'#9E9590', margin:0 }}>
              ⚠️ {failedVideos.length} video(s) failed to index. The bees are investigating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
