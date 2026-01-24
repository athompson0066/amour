
import React, { useState } from 'react';
import { Clock, Lock, BookOpen, Mic, Link as LinkIcon, Check } from 'lucide-react';
import { Post } from '../types';

interface ArticleCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = () => {
    switch (post.type) {
      case 'course': return <BookOpen size={14} className="mr-1" />;
      case 'podcast': return <Mic size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getShadowColor = () => {
      switch(post.type) {
          case 'course': return 'group-hover:shadow-indigo-300/40 border-indigo-100';
          case 'podcast': return 'group-hover:shadow-purple-300/40 border-purple-100';
          default: return 'group-hover:shadow-rose-300/40 border-rose-100';
      }
  }

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl transition-all duration-500 cursor-pointer h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl ${getShadowColor()} shadow-sm border border-white/50`}
      onClick={() => onClick(post)}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl p-1">
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10 rounded-t-[20px]" />
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover rounded-t-[20px] transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Floating Badges */}
        <div className="absolute top-4 right-4 z-20 flex space-x-2">
            <button 
                onClick={handleCopyLink}
                className="glass-dark text-white p-2 rounded-full hover:bg-slate-900/80 transition-all border border-white/10"
                title="Copy Link"
            >
                {copied ? <Check size={12} className="text-emerald-400" /> : <LinkIcon size={12} />}
            </button>
            {post.isPremium && (
            <div className="glass-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-md border border-white/10">
                <Lock size={10} className="mr-1 text-yellow-400" /> 
                {post.type === 'course' && post.price ? `$${post.price}` : 'PREMIUM'}
            </div>
            )}
        </div>
        
        <div className="absolute bottom-4 left-4 z-20">
             <div className="glass text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm uppercase tracking-wide border border-white/80">
                {getTypeIcon()} {post.type}
            </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex-grow">
          <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-purple-600 transition-all leading-tight mb-3">
            {post.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-light leading-relaxed group-hover:text-slate-600">
            {post.subtitle}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-br from-rose-200 to-purple-200 mr-2 group-hover:from-rose-400 group-hover:to-purple-400 transition-colors">
                 <img src={post.author.avatar} alt={post.author.name} className="h-full w-full rounded-full border-2 border-white object-cover" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{post.author.name}</span>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
            <Clock size={12} className="mr-1.5" />
            {post.readTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
