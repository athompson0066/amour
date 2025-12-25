import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { fetchVideos } from '../services/youtubeService';
import { PlayCircle, X, Loader2, Youtube, AlertCircle, RefreshCw } from 'lucide-react';
import { FadeIn, StaggerGrid, StaggerItem } from './Animated';

const CATEGORIES = [
    "Latest",
    "Communication",
    "Dating Advice",
    "Marriage",
    "Self Love",
    "Breakups",
    "Intimacy"
];

const VideoHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("Latest");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    loadVideos();
  }, [activeCategory]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await fetchVideos(activeCategory);
        setVideos(data);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load videos.");
    } finally {
        setLoading(false);
    }
  };

  const getEmbedUrl = (videoId: string) => {
    // FIX FOR ERROR 153:
    // 1. Use youtube-nocookie.com (Privacy Enhanced Mode)
    // 2. REMOVE the 'origin' parameter completely. In sandboxed environments, origin is often null/opaque.
    // 3. Keep autoplay=1
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <FadeIn>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <Youtube className="text-red-600" size={28} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Relationship Video Hub</h1>
                </div>
                <p className="text-slate-500 max-w-2xl text-lg">
                    Curated video advice from top relationship experts across the web.
                </p>
            </FadeIn>
            
            {/* Category Filter */}
            <div className="mt-8 flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            activeCategory === cat 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-rose-500" size={40} />
            </div>
        ) : error ? (
            <div className="text-center py-16 bg-white rounded-xl border border-red-100 shadow-sm max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Videos</h3>
                <p className="text-slate-600 mb-6 px-6">{error}</p>
                <button 
                    onClick={loadVideos} 
                    className="inline-flex items-center px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors shadow-sm font-medium"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                </button>
            </div>
        ) : videos.length === 0 ? (
             <div className="text-center py-20">
                <p className="text-slate-500">No videos found for this category.</p>
             </div>
        ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map(video => (
                    <StaggerItem key={video.id}>
                        <div 
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 h-full flex flex-col"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className="relative aspect-video bg-slate-200 overflow-hidden">
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                        <PlayCircle className="text-rose-600 ml-1" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                                        {decodeHTML(video.title)}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{video.description}</p>
                                </div>
                                <div className="text-xs font-medium text-slate-400 border-t border-slate-50 pt-3">
                                    {video.channelTitle} • {new Date(video.publishedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerGrid>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
            <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setSelectedVideo(null)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/50 p-2 rounded-full backdrop-blur-md"
                >
                    <X size={24} />
                </button>
                <div className="aspect-video w-full">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={getEmbedUrl(selectedVideo.id)}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        // Use strict-origin-when-cross-origin to satisfy new YouTube iframe requirements
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="border-0 w-full h-full"
                    ></iframe>
                </div>
                <div className="p-6 bg-slate-900 text-white">
                    <h2 className="text-xl font-bold mb-2">{decodeHTML(selectedVideo.title)}</h2>
                    <p className="text-slate-400 text-sm">{selectedVideo.description}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

function decodeHTML(html: string) {
    if (!html) return "";
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

export default VideoHub;