import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './components/DashboardLayout';
import VideoPlayer from './components/VideoPlayer';
import CollectionsView from './components/CollectionsView';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/* ── Daisy SVG —– inline for the logo ── */
const DaisySVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    {[0,45,90,135,180,225,270,315].map((deg, i) => (
      <ellipse key={i} cx="16" cy="16" rx="3" ry="6"
        fill="#E8A598" stroke="#4A443F" strokeWidth="1"
        transform={`rotate(${deg} 16 16) translate(0 -7)`} />
    ))}
    <circle cx="16" cy="16" r="5" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.5"/>
  </svg>
);

/* ── Bee SVG ── */
const BeeSVG = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="14" rx="5" ry="4" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.2"/>
    <rect x="9" y="13" width="6" height="2" rx="1" fill="#4A443F" opacity="0.4"/>
    <rect x="9" y="15.5" width="6" height="1.5" rx="0.75" fill="#4A443F" opacity="0.4"/>
    <ellipse cx="12" cy="10" rx="3" ry="2.5" fill="#F2C94C" stroke="#4A443F" strokeWidth="1.2"/>
    <ellipse cx="9" cy="9" rx="3.5" ry="2" fill="rgba(92,158,155,0.5)" stroke="#4A443F" strokeWidth="0.8" transform="rotate(-25 9 9)"/>
    <ellipse cx="15" cy="9" rx="3.5" ry="2" fill="rgba(92,158,155,0.5)" stroke="#4A443F" strokeWidth="0.8" transform="rotate(25 15 9)"/>
  </svg>
);

function App() {
  const [view, setView] = useState('dashboard');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [collections, setCollections] = useState([]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/videos`);
      setVideos(res.data);
    } catch (err) { console.error('Failed to fetch videos', err); }
  };

  const fetchCollections = async () => {
    try {
      const res = await axios.get(`${API_BASE}/collections`);
      setCollections(res.data);
    } catch (err) { console.error('Failed to fetch collections', err); }
  };

  useEffect(() => {
    fetchVideos();
    fetchCollections();
  }, []);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setView('search');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Quicksand', sans-serif" }}>

      {/* ── Global Header ──────────────────────────────────── */}
      <nav style={{
        background: 'rgba(245,240,232,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1.5px solid #4A443F',
        boxShadow: '0 2px 0 #4A443F',
        padding: '0.75rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={handleBack}
          style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}
        >
          <DaisySVG />
          <div>
            <div style={{ fontFamily:"'Caveat',cursive", fontSize:'1.5rem', fontWeight:600, color:'#3D3731', lineHeight:1.1 }}>
              DeepIndex
            </div>
            <div style={{ fontSize:'0.65rem', color:'#7B9E72', fontWeight:600, letterSpacing:'0.1em' }}>
              🐝 Semantic Video Search
            </div>
          </div>
        </div>

        {/* Nav Buttons */}
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <button
            onClick={handleBack}
            className="btn-cottage-pink"
            style={{ opacity: view === 'dashboard' ? 1 : 0.65, fontSize:'0.85rem', padding:'0.4rem 1rem' }}
          >
            🏡 Studio
          </button>
          <button
            onClick={() => setView('collections')}
            className="btn-cottage"
            style={{ opacity: view === 'collections' ? 1 : 0.65, fontSize:'0.85rem', padding:'0.4rem 1rem' }}
          >
            📌 DeepPins
          </button>
          {selectedVideo && (
            <button
              onClick={() => setView('search')}
              className="btn-cottage"
              style={{
                background:'#5C9E9B',
                opacity: view === 'search' ? 1 : 0.65,
                fontSize:'0.85rem', padding:'0.4rem 1rem'
              }}
            >
              🎬 {selectedVideo.title.substring(0, 16)}
            </button>
          )}
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main style={{ maxWidth:'1400px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        {view === 'dashboard' && (
          <DashboardLayout
            onVideoSelect={handleVideoSelect}
            videos={videos}
            onRefresh={fetchVideos}
          />
        )}
        {view === 'search' && selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onBack={handleBack}
            collections={collections}
            onCollectionUpdate={fetchCollections}
          />
        )}
        {view === 'collections' && (
          <CollectionsView
            collections={collections}
            onUpdate={fetchCollections}
            onVideoSelect={handleVideoSelect}
            videos={videos}
          />
        )}
      </main>
    </div>
  );
}

export default App;
