
import React, { useState } from 'react';
import { Clock, Lock, BookOpen, Mic, Link as LinkIcon, Check, Globe, LayoutGrid, List as ListIcon, ArrowRight } from 'lucide-react';
import { Post } from '../types';

interface ArticleCardProps {
  post: Post;
  onClick: (post: Post) => void;
  viewMode?: 'grid' | 'list';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, onClick, viewMode = 'grid' }) => {
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
      case 'website': return <Globe size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getThemeColors = () => {
      switch(post.type) {
          case 'course': return { shadow: 'group-hover:shadow-indigo-300/40', border: 'border-indigo-100', text: 'text-indigo-600', bg: 'bg-indigo-50' };
          case 'podcast': return { shadow: 'group-hover:shadow-purple-300/40', border: 'border-purple-100', text: 'text-purple-600', bg: 'bg-purple-50' };
          case 'website': return { shadow: 'group-hover:shadow-emerald-300/40', border: 'border-emerald-100', text: 'text-emerald-600', bg: 'bg-emerald-50' };
          default: return { shadow: 'group-hover:shadow-rose-300/40', border: 'border-rose-100', text: 'text-rose-600', bg: 'bg-rose-50' };
      }
  };

  const theme = getThemeColors();

  if (viewMode === 'list') {
      return (
          <div 
            onClick={() => onClick(post)}
            className={`group flex flex-col md:flex-row bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer`}
          >
              <div className="md:w-64 h-48 md:h-full relative overflow-hidden flex-shrink-0">
                  <img src={post.coverImage} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
                  <div className="absolute top-4 left-4 z-10">
                       <div className="glass text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center shadow-sm uppercase tracking-widest border border-white/80">
                        {getTypeIcon()} {post.type}
                      </div>
                  </div>
              </div>
              <div className="p-8 flex flex-col justify-center flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.bg} ${theme.text} border border-transparent group-hover:border-current transition-colors`}>
                              {tag}
                          </span>
                      ))}
                      {post.isPremium && <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Premium</span>}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors leading-tight">{post.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 md:line-clamp-2">
                      {post.subtitle || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                              <img src={post.author.avatar} className="w-6 h-6 rounded-full border border-white shadow-sm mr-2" alt={post.author.name} />
                              <span className="text-xs font-bold text-slate-600">{post.author.name}</span>
                          </div>
                          <div className="flex items-center text-xs text-slate-400 font-medium">
                              <Clock size={12} className="mr-1.5" />
                              {post.readTime}
                          </div>
                      </div>
                      <button className={`flex items-center space-x-2 text-xs font-black uppercase tracking-widest ${theme.text} opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0`}>
                          <span>Explore {post.type === 'podcast' ? 'Episode' : 'Content'}</span>
                          <ArrowRight size={14} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl transition-all duration-500 cursor-pointer h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl ${theme.shadow} shadow-sm border border-white/50`}
      onClick={() => onClick(post)}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl p-1">
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10 rounded-t-[20px]" />
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover rounded-t-[20px] transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
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
      
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex-grow">
          <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-purple-600 transition-all leading-tight mb-3">
            {post.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-3 mb-6 font-light leading-relaxed group-hover:text-slate-700">
            {post.subtitle || "No description provided."}
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
