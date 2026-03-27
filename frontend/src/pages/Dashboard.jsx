import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Play, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

function Dashboard({ onVideoSelect, videos, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name);

    try {
      await axios.post(`${API_BASE}/upload`, formData);
      setTitle('');
      setFile(null);
      setTimeout(onRefresh, 1000); // Wait for metadata to save
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Upload Section */}
      <section className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-3xl border-neon/20 space-y-6"
        >
          <h2 className="text-3xl font-semibold text-center mb-8">Upload Video</h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <input 
              type="text"
              placeholder="Video Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-panel border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
            />
            
            <div className="relative group cursor-pointer">
              <input 
                type="file" 
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-white/20 group-hover:border-neon/50 rounded-2xl p-12 text-center transition-all bg-white/0 group-hover:bg-white/5">
                <Upload className="mx-auto text-neon/60 w-12 h-12 mb-4 group-hover:scale-110 transition" />
                <p className="text-gray-400">
                  {file ? <span className="text-neon font-medium">{file.name}</span> : 'Drag and drop your MP4 file here'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Max size: 50MB</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-neon text-deep font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" /> : 'Start Indexing'}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Video List */}
      <section>
        <h3 className="text-2xl font-bold mb-6">Recent Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <motion.div 
              key={vid.videoId}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl cursor-pointer hover:border-neon/30 transition group"
              onClick={() => vid.status === 'completed' && onVideoSelect(vid)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-neon/10 rounded-full flex items-center justify-center">
                  <Play className="text-neon w-5 h-5" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                  vid.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                  vid.status === 'processing' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {vid.status}
                </span>
              </div>
              <h4 className="font-bold text-lg mb-1 truncate">{vid.title}</h4>
              <p className="text-sm text-gray-400">{new Date(vid.uploadDate).toLocaleDateString()}</p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm">
                {vid.status === 'completed' ? (
                  <span className="text-neon flex items-center gap-1">Jump to search <CheckCircle className="w-4 h-4" /></span>
                ) : vid.status === 'processing' ? (
                  <span className="text-blue-400 flex items-center gap-1">Analyzing content... <Loader2 className="w-3 h-3 animate-spin" /></span>
                ) : (
                  <span className="text-red-400">Processing failed</span>
                )}
              </div>
            </motion.div>
          ))}
          {videos.length === 0 && !uploading && (
            <div className="col-span-full text-center py-20 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
              No videos indexed yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
