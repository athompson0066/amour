
import React, { useState, useMemo, useEffect } from 'react';
import { Post, User, ContentBlock, VideoItem } from '../types';
import { ArrowLeft, Calendar, Clock, Share2, Lock, CheckCircle, ChevronRight, Star, BookOpen, Check, Map, Lightbulb, ListChecks, PenTool, BrainCircuit, PlayCircle, X, Youtube } from 'lucide-react';
import { ParallaxHeader, FadeIn, StaggerGrid, StaggerItem } from './Animated';

interface ArticleViewProps {
  post: Post;
  user: User | null;
  onBack: () => void;
  onUnlock: () => void;
  onLoginRequest: () => void;
}

// Helper to render rich text from AI response (bolding, lists, icons)
const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-3 text-lg text-slate-700 leading-relaxed font-light">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <br key={i} />;

                // Special Headers mapping to Icons
                if (trimmed.startsWith('### Key Concept')) {
                    return (
                        <div key={i} className="flex items-center space-x-3 text-xl font-bold text-amber-700 bg-amber-50 p-4 rounded-xl mt-8 mb-4 border border-amber-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <Lightbulb className="text-amber-500 w-5 h-5" />
                            </div>
                            <span>{trimmed.replace(/#/g, '').replace('Key Concept', '').trim() || 'Key Concept'}</span>
                        </div>
                    );
                }
                if (trimmed.startsWith('### Action Steps') || trimmed.startsWith('### Actionable Steps')) {
                     return (
                        <div key={i} className="flex items-center space-x-3 text-xl font-bold text-emerald-700 bg-emerald-50 p-4 rounded-xl mt-8 mb-4 border border-emerald-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <ListChecks className="text-emerald-500 w-5 h-5" />
                            </div>
                            <span>{trimmed.replace(/#/g, '').replace(/Action(able)? Steps/, '').trim() || 'Action Steps'}</span>
                        </div>
                    );
                }
                if (trimmed.startsWith('### Practical Exercise') || trimmed.startsWith('### Homework')) {
                     return (
                        <div key={i} className="flex items-center space-x-3 text-xl font-bold text-blue-700 bg-blue-50 p-4 rounded-xl mt-8 mb-4 border border-blue-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <PenTool className="text-blue-500 w-5 h-5" />
                            </div>
                            <span>{trimmed.replace(/#/g, '').replace(/(Practical )?Exercise/, '').replace('Homework', '').trim() || 'Practical Exercise'}</span>
                        </div>
                    );
                }
                if (trimmed.startsWith('### Reflection') || trimmed.startsWith('### Why This Matters')) {
                     return (
                        <div key={i} className="flex items-center space-x-3 text-xl font-bold text-purple-700 bg-purple-50 p-4 rounded-xl mt-8 mb-4 border border-purple-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <BrainCircuit className="text-purple-500 w-5 h-5" />
                            </div>
                            <span>{trimmed.replace(/#/g, '').replace('Reflection', '').replace('Why This Matters', '').trim() || 'Reflection'}</span>
                        </div>
                    );
                }

                // Standard Subheaders
                if (trimmed.startsWith('###')) {
                    return <h3 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-2">{formatInlineStyles(trimmed.replace(/#/g, '').trim())}</h3>;
                }

                // Lists
                if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                     return (
                         <div key={i} className="flex items-start ml-2 mb-2">
                             <span className="text-rose-500 mr-3 mt-2 text-[8px]">●</span>
                             <span>{formatInlineStyles(trimmed.replace(/^[-*•]\s*/, ''))}</span>
                         </div>
                     );
                }
                // Numbered Lists
                if (/^\d+\./.test(trimmed)) {
                     const number = trimmed.split('.')[0];
                     const text = trimmed.substring(trimmed.indexOf('.') + 1).trim();
                     return (
                        <div key={i} className="flex items-start ml-2 mb-2">
                             <span className="text-rose-600 font-bold mr-3 min-w-[1.5rem]">{number}.</span>
                             <span>{formatInlineStyles(text)}</span>
                        </div>
                     );
                }
                // Blockquotes
                if (trimmed.startsWith('>')) {
                    return (
                        <div key={i} className="bg-rose-50 border-l-4 border-rose-400 p-5 my-6 rounded-r-xl italic text-slate-800 text-lg">
                             {formatInlineStyles(trimmed.substring(1).trim())}
                        </div>
                    );
                }
                // Standard Paragraphs
                return <p key={i} className="mb-2">{formatInlineStyles(trimmed)}</p>;
            })}
        </div>
    );
};

// Helper to handle **Bold** text
const formatInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const ArticleView: React.FC<ArticleViewProps> = ({ post, user, onBack, onUnlock, onLoginRequest }) => {
  const hasAccess = !post.isPremium || (user && user.purchasedContentIds.includes(post.id)) || (user && user.isSubscriber);
  const isCourse = post.type === 'course';
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Group blocks into logical sections for Courses
  const courseSections = useMemo(() => {
    if (!isCourse) return [post.blocks]; 

    const sections: ContentBlock[][] = [];
    let currentSection: ContentBlock[] = [];

    post.blocks.forEach((block) => {
        const isModuleHeader = block.type === 'header' && 
            (block.content.includes('Week') || block.content.includes('Module') || block.content.includes('Conclusion'));

        if (isModuleHeader && currentSection.length > 0) {
            sections.push(currentSection);
            currentSection = [];
        }
        currentSection.push(block);
    });
    if (currentSection.length > 0) sections.push(currentSection);

    return sections;
  }, [post, isCourse]);

  const sectionTitles = useMemo(() => {
      if (!isCourse) return [];
      return courseSections.map((section, idx) => {
          const headerBlock = section.find(b => b.type === 'header' && (b.content.toLowerCase().includes('week') || b.content.toLowerCase().includes('module') || b.content.toLowerCase().includes('intro') || b.content.toLowerCase().includes('conclusion')));
          
          if (headerBlock) {
               const clean = headerBlock.content.split(':')[0].replace(/[*#]/g, '').trim();
               return clean.length > 15 ? `Part ${idx+1}` : clean;
          }
          return idx === 0 ? "Intro" : `Part ${idx+1}`;
      });
  }, [courseSections, isCourse]);

  const [completedSections, setCompletedSections] = useState<number>(() => {
      const stored = localStorage.getItem(`amour_progress_${post.id}`);
      return stored ? parseInt(stored) : 0;
  });

  const handleCompleteSection = () => {
      const next = completedSections + 1;
      setCompletedSections(next);
      localStorage.setItem(`amour_progress_${post.id}`, next.toString());
      
      setTimeout(() => {
          const nextEl = document.getElementById(`section-${next}`);
          if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const progressPercentage = Math.round((completedSections / courseSections.length) * 100);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const paywall = {
      title: 'Enroll in this Course',
      description: `Unlock the full curriculum and start your journey today.`,
      button: `Buy Now for ${post.price ? `$${post.price}` : 'Member Access'}`
  };

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Course Progress Bar (Sticky) */}
      {isCourse && hasAccess && (
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm px-6 py-3 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-4">
                  <div className="flex items-center text-rose-600 font-bold uppercase tracking-wider text-xs">
                     <Map size={14} className="mr-2" />
                     <span>Progress</span>
                  </div>
                  <div className="hidden md:block w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                  </div>
              </div>
              <div className="text-xs font-medium text-slate-500">
                  <span className="text-rose-600 font-bold">{progressPercentage}%</span> Complete
                  <span className="mx-2 text-slate-300">|</span>
                  {courseSections.length - completedSections} Steps Left
              </div>
          </div>
      )}

      {/* Parallax Hero Header */}
      <ParallaxHeader imageUrl={post.coverImage}>
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Directory</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12 max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="inline-block px-3 py-1 bg-rose-500 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                {post.type}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight shadow-sm">
                {post.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-6 font-light max-w-2xl mx-auto">
                {post.subtitle}
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-slate-300 text-sm">
                <div className="flex items-center">
                    <img src={post.author.avatar} alt="Author" className="w-8 h-8 rounded-full border-2 border-rose-500 mr-2" />
                    <span className="text-white font-medium">{post.author.name}</span>
                </div>
                <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {post.readTime}
                </div>
                {hasAccess && post.isPremium && (
                    <div className="flex items-center text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">
                        <CheckCircle size={14} className="mr-1" />
                        Purchased
                    </div>
                )}
            </div>
          </FadeIn>
        </div>
      </ParallaxHeader>

      {/* Course Roadmap Visualization */}
      {isCourse && hasAccess && (
         <FadeIn className="max-w-4xl mx-auto px-6 pt-12 -mb-8 relative z-20">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-100 shadow-sm p-8">
               <div className="flex justify-between items-end mb-8">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Learning Journey</h3>
               </div>
               
               <div className="relative mx-2">
                  <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                  <div 
                     className="absolute top-4 left-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600 -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${(completedSections / (Math.max(1, courseSections.length - 1))) * 100}%` }}
                  ></div>
        
                  <div className="relative z-10 flex justify-between w-full">
                    {courseSections.map((_, idx) => {
                        const isCompleted = idx < completedSections;
                        const isCurrent = idx === completedSections;
                        
                        return (
                            <div key={idx} className="flex flex-col items-center group cursor-default">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-20
                                    ${isCompleted ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200' : 
                                      isCurrent ? 'bg-white border-rose-500 text-rose-600 scale-125 shadow-lg shadow-rose-100 ring-4 ring-rose-50' : 
                                      'bg-white border-slate-200 text-slate-300'}
                                `}>
                                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <div className={`mt-4 text-[10px] font-bold uppercase tracking-wide transition-all duration-300 text-center max-w-[80px] leading-tight
                                    ${isCurrent ? 'text-rose-600 transform scale-105' : 
                                      isCompleted ? 'text-slate-500' : 'text-slate-300 hidden md:block'}
                                `}>
                                    {sectionTitles[idx]}
                                </div>
                            </div>
                        )
                    })}
                  </div>
               </div>
            </div>
         </FadeIn>
      )}

      <article className="max-w-3xl mx-auto px-6 py-12">
        {courseSections.map((section, sectionIndex) => {
            if (!hasAccess && post.isPremium && sectionIndex > 0) {
                if (sectionIndex === 1) {
                    return (
                        <FadeIn key="paywall" className="relative mt-8 p-12 bg-rose-50 rounded-3xl border border-rose-100 text-center overflow-hidden shadow-sm">
                            <div className="relative z-10">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-rose-500 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">{paywall.title}</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">{paywall.description}</p>
                            {user ? (
                                <button onClick={onUnlock} className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition-transform hover:scale-105 shadow-lg">
                                    {paywall.button}
                                </button>
                            ) : (
                                <button onClick={onLoginRequest} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-transform hover:scale-105 shadow-lg">
                                    Sign In to Purchase
                                </button>
                            )}
                            <p className="mt-4 text-xs text-slate-500">Secure payment via PayPal</p>
                            </div>
                        </FadeIn>
                    );
                }
                return null;
            }

            if (isCourse && hasAccess && sectionIndex > completedSections) {
                return (
                    <div key={sectionIndex} className="mt-8 p-8 border-2 border-dashed border-slate-200 rounded-xl text-center opacity-50">
                        <Lock className="mx-auto text-slate-300 mb-2" size={24} />
                        <p className="text-slate-400 font-medium">Complete previous module to unlock</p>
                    </div>
                );
            }

            const isCurrentActiveSection = sectionIndex === completedSections;
            const isCompleted = sectionIndex < completedSections;

            return (
                <div key={sectionIndex} id={`section-${sectionIndex}`} className={`mb-16 scroll-mt-32 ${isCompleted ? 'opacity-80' : ''}`}>
                    {section.map((block) => {
                        switch(block.type) {
                            case 'header':
                                if (block.content.includes('Week') || block.content.includes('Module') || block.content.includes('Intro') || block.content.includes('Conclusion')) {
                                    return (
                                        <FadeIn key={block.id} className="mt-16 mb-8">
                                            <div className="flex items-center space-x-2 text-rose-500 font-bold uppercase tracking-wider text-sm mb-2">
                                                {isCompleted ? <CheckCircle size={16} /> : <BookOpen size={16} />}
                                                <span>{isCompleted ? 'Completed Module' : 'Current Module'}</span>
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                                                {block.content}
                                            </h2>
                                            <div className="h-1 w-20 bg-rose-200 mt-4 rounded-full"></div>
                                        </FadeIn>
                                    );
                                }
                                return <FadeIn key={block.id}><h2 className="text-2xl font-serif font-bold text-slate-900 mt-10 mb-4">{block.content}</h2></FadeIn>;
                            
                            case 'text':
                                return <FadeIn key={block.id} className="mb-8"><RichTextRenderer content={block.content} /></FadeIn>;
                            
                            case 'quote':
                                return (
                                    <FadeIn key={block.id}>
                                        <blockquote className="border-l-4 border-rose-400 pl-6 py-4 my-10 italic text-xl text-slate-800 bg-slate-50 rounded-r-lg shadow-sm">
                                            "{block.content}"
                                        </blockquote>
                                    </FadeIn>
                                );
                            
                            case 'image':
                                return <FadeIn key={block.id}><img src={block.content} alt="Content" className="w-full rounded-xl shadow-md my-8" /></FadeIn>;
                            
                            case 'cta':
                                return (
                                    <FadeIn key={block.id}>
                                        <div className="my-12 p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white text-center shadow-xl relative overflow-hidden">
                                            <div className="relative z-10">
                                                <Star className="text-yellow-400 mx-auto mb-4 w-12 h-12" />
                                                <h4 className="text-2xl font-bold mb-4 font-serif">Congratulations!</h4>
                                                <p className="mb-8 opacity-90 text-lg">{block.content}</p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                );
                            default: return null;
                        }
                    })}

                    {isCourse && hasAccess && isCurrentActiveSection && sectionIndex < courseSections.length - 1 && (
                        <FadeIn className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                 <Check size={24} />
                             </div>
                             <h4 className="text-lg font-bold text-slate-900 mb-2">Ready to move on?</h4>
                             <p className="text-slate-600 mb-6 text-sm">Make sure you have completed the exercises for this week.</p>
                             <button 
                                onClick={handleCompleteSection}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transform transition hover:scale-105 flex items-center"
                             >
                                 <CheckCircle className="mr-2" size={18} />
                                 Complete {sectionTitles[sectionIndex]} & Continue
                             </button>
                        </FadeIn>
                    )}
                </div>
            );
        })}

        {/* Integrated Related Videos Section */}
        {hasAccess && post.relatedVideos && post.relatedVideos.length > 0 && (
            <FadeIn className="mt-20 pt-10 border-t border-slate-100">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-red-100 p-2 rounded-lg">
                        {/* Add Youtube icon import from lucide-react to fix 'Cannot find name Youtube' error. */}
                        <Youtube className="text-red-600" size={20} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Recommended Video Resources</h3>
                </div>
                <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {post.relatedVideos.map((video) => (
                        <StaggerItem key={video.id}>
                            <div 
                                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={video.thumbnail} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                        <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors">{video.title}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{video.channelTitle}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerGrid>
            </FadeIn>
        )}

        {/* Tags */}
        <div className="mt-16 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Share Section */}
        <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center">
          <div className="text-slate-500 italic">Published on {formatDate(post.publishedAt)}</div>
          <button className="flex items-center space-x-2 text-rose-600 font-medium hover:text-rose-700">
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </article>

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
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="border-0 w-full h-full"
                    ></iframe>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ArticleView;
