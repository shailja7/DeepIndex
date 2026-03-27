import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, Play, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function VideoSearch({ video }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/search`, {
        params: { query, videoId: video.videoId }
      });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const jumpTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
      {/* Video Player Section */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="relative rounded-3xl overflow-hidden glass neon-border aspect-video group">
          <video 
            ref={videoRef}
            src={`http://localhost:5000/uploads/${video.filename}`} // Assuming direct serve for simplicity
            controls={false}
            className="w-full h-full object-contain"
          />
          
          {/* Custom Overlay (Optional, but adding basic controls) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition">
             <div className="flex items-center gap-4">
               <button onClick={() => videoRef.current.play()} className="p-2 bg-neon rounded-full text-deep"><Play fill="currentColor" size={16} /></button>
               <div className="h-1 bg-white/20 flex-grow rounded-full overflow-hidden">
                 <div className="h-full bg-neon w-1/3 shadow-[0_0_10px_#A78BFA]" />
               </div>
             </div>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <p className="text-gray-400 text-sm">Uploaded on {new Date(video.uploadDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Search & Transcription Results */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text"
            placeholder="Search concepts, topics, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-neon/40 glass"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <AnimatePresence>
            {results.map((res, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => jumpTo(res.startTime)}
                className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-neon hover:shadow-[0_0_15px_rgba(167,139,250,0.5)] border border-white/10 transition group relative"
              >
                <div className="flex items-center gap-3 mb-2 text-[#A78BFA] text-xs font-bold uppercase tracking-wider">
                  <Clock size={14} />
                  <span>{Math.floor(res.startTime)}s - {Math.floor(res.endTime)}s</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition">
                    <ArrowRight size={14} />
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">

                  "{res.text}"
                </p>
                <div className="mt-3 flex gap-1">
                   <div className="h-1 bg-neon/30 flex-grow rounded-full overflow-hidden">
                      <div className="h-full bg-neon" style={{ width: `${res.score * 100}%` }} />
                   </div>
                   <span className="text-[10px] text-gray-500 uppercase font-black">Score: {Math.floor(res.score * 100)}%</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {results.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
               <p>Enter a query to search specifically within this video.</p>
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center gap-4 py-20">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                 <Loader2 className="text-neon w-10 h-10" />
               </motion.div>
               <p className="text-gray-400">Embedding query...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Loader2 for VideoSearch scope
const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default VideoSearch;
