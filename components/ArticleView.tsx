
import React, { useState, useMemo, useEffect } from 'react';
import { Post, User, ContentBlock, VideoItem, Agent } from '../types';
import { 
    ArrowLeft, Calendar, Clock, Share2, Lock, CheckCircle, ChevronRight, Star, 
    BookOpen, Check, Map, Lightbulb, ListChecks, PenTool, BrainCircuit, 
    PlayCircle, X, Youtube, Twitter, Facebook, Linkedin, Link, MessageCircle, UserCheck, MessageSquare, Phone, AlertTriangle
} from 'lucide-react';
import { ParallaxHeader, FadeIn, StaggerGrid, StaggerItem } from './Animated';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgents, getAstroAgents } from '../services/storage';
import ChatInterface from './ChatInterface';
import VoiceInterface from './VoiceInterface';

interface ArticleViewProps {
  post: Post;
  user: User | null;
  onBack: () => void;
  onUnlock: () => void;
  onLoginRequest: () => void;
}

// Expert Embed Component - Supports complete AI interactive experience
const ExpertEmbed: React.FC<{ agentIdOrSlug: string }> = ({ agentIdOrSlug }) => {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [activeMode, setActiveMode] = useState<'none' | 'chat' | 'voice'>('none');
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const all = [...getAgents(), ...getAstroAgents()];
        const target = agentIdOrSlug.toLowerCase().trim();
        // Find by ID or by Custom Shortcode Slug
        const found = all.find(a => 
            a.id.toLowerCase() === target || 
            (a.embedCode && a.embedCode.toLowerCase() === target)
        );
        if (found) setAgent(found);
        setHasLoaded(true);
    }, [agentIdOrSlug]);

    if (!hasLoaded) return null;

    if (!agent) {
        return (
            <div className="my-6 p-4 border border-dashed border-slate-200 rounded-xl flex items-center text-slate-400 text-xs italic bg-slate-50/50">
                <AlertTriangle size={14} className="mr-2 text-amber-500" />
                Expert reference "{agentIdOrSlug}" not found.
            </div>
        );
    }

    return (
        <div className="my-12 relative">
            <div className="p-8 bg-gradient-to-br from-white to-rose-50/50 rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-900/5 flex flex-col md:flex-row items-center gap-8 group">
                <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <img src={agent.avatar} className="w-full h-full object-cover" alt={agent.name} />
                    </div>
                    {agent.isOnline && (
                        <div className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-green-500 border-[4px] border-white rounded-full flex items-center justify-center shadow-md">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-2">
                        <h4 className="text-2xl font-serif font-bold text-slate-900">{agent.name}</h4>
                        <p className="text-rose-600 text-xs font-black uppercase tracking-[0.2em]">{agent.role}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-xl">
                        {agent.description}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button 
                            onClick={() => setActiveMode('chat')}
                            className="group flex items-center space-x-2 bg-slate-900 text-white px-8 py-3.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-all hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1"
                        >
                            <MessageSquare size={16} />
                            <span>Private Consultation</span>
                        </button>
                        <button 
                            onClick={() => setActiveMode('voice')}
                            className="group flex items-center space-x-2 bg-white border border-rose-200 text-rose-600 px-8 py-3.5 rounded-full text-xs font-bold hover:bg-rose-50 transition-all hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1"
                        >
                            <Phone size={16} className="fill-current" />
                            <span>Audio Call</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Experience Overlay */}
            <AnimatePresence>
                {activeMode !== 'none' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveMode('none')}
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
                        >
                            <button 
                                onClick={() => setActiveMode('none')}
                                className="absolute top-6 right-6 z-[110] p-3 bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white rounded-full transition-all shadow-lg"
                            >
                                <X size={24} />
                            </button>
                            
                            {activeMode === 'chat' && <ChatInterface agent={agent} onBack={() => setActiveMode('none')} />}
                            {activeMode === 'voice' && <VoiceInterface agent={agent} onEndCall={() => setActiveMode('none')} />}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Advanced Content Renderer with Integrated Shortcode Injection
const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
    // 1. Get all available agent slugs and IDs
    const allAgents = [...getAgents(), ...getAstroAgents()];
    const agentIdentifiers = allAgents.flatMap(a => [
        `[agent:${a.id}]`,
        `[${a.embedCode}]`,
        a.embedCode
    ]).filter(Boolean) as string[];

    // 2. We need a regex that matches any of these identifiers.
    // Brackets require escaping in regex.
    const escapedIdentifiers = agentIdentifiers.map(id => 
        id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    
    // Sort identifiers by length descending to prevent partial matching (e.g. 'agent' matching before 'agent-slug')
    escapedIdentifiers.sort((a, b) => b.length - a.length);
    
    const combinedRegex = new RegExp(`(${escapedIdentifiers.join('|')})`, 'g');

    // 3. Split the content and render parts
    const parts = content.split(combinedRegex);

    return (
        <div className="space-y-4 text-lg text-slate-700 leading-relaxed font-light">
            {parts.map((part, index) => {
                const trimmedPart = part.trim();
                
                // check if this part is one of our agent identifiers
                const isAgent = agentIdentifiers.some(id => id === part);

                if (isAgent) {
                    const cleanSlug = part.startsWith('[agent:') 
                        ? part.slice(7, -1) 
                        : part.startsWith('[') 
                            ? part.slice(1, -1) 
                            : part;
                    return <ExpertEmbed key={index} agentIdOrSlug={cleanSlug} />;
                }

                // Standard formatting for normal text parts
                const lines = part.split('\n');
                return (
                    <React.Fragment key={index}>
                        {lines.map((line, i) => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) return <div key={i} className="h-4" />;

                            // Headers and special UI sections
                            if (trimmedLine.startsWith('### Key Concept')) {
                                return (
                                    <div key={i} className="flex items-center space-x-4 text-xl font-bold text-amber-800 bg-amber-50 p-6 rounded-3xl mt-12 mb-6 border border-amber-100 shadow-sm">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><Lightbulb className="text-amber-500 w-6 h-6" /></div>
                                        <span>{trimmedLine.replace(/###/g, '').replace('Key Concept', '').replace(/:/g, '').trim() || 'Core Strategy'}</span>
                                    </div>
                                );
                            }
                            if (trimmedLine.startsWith('### Action Steps')) {
                                return (
                                    <div key={i} className="flex items-center space-x-4 text-xl font-bold text-emerald-800 bg-emerald-50 p-6 rounded-3xl mt-12 mb-6 border border-emerald-100 shadow-sm">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><ListChecks className="text-emerald-500 w-6 h-6" /></div>
                                        <span>{trimmedLine.replace(/###/g, '').replace('Action Steps', '').replace(/:/g, '').trim() || 'Next Steps'}</span>
                                    </div>
                                );
                            }
                            if (trimmedLine.startsWith('### Reflection') || trimmedLine.startsWith('### Why This Matters')) {
                                return (
                                    <div key={i} className="flex items-center space-x-4 text-xl font-bold text-purple-800 bg-purple-50 p-6 rounded-3xl mt-12 mb-6 border border-purple-100 shadow-sm">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><BrainCircuit className="text-purple-500 w-6 h-6" /></div>
                                        <span>{trimmedLine.replace(/###/g, '').replace('Reflection', '').replace('Why This Matters', '').replace(/:/g, '').trim() || 'Deep Insight'}</span>
                                    </div>
                                );
                            }
                            
                            if (trimmedLine.startsWith('###')) {
                                return <h3 key={i} className="text-2xl font-serif font-bold text-slate-900 mt-12 mb-4 leading-tight">{formatInlineStyles(trimmedLine.replace(/###/g, '').trim())}</h3>;
                            }

                            // Bullet Lists
                            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                                 return (
                                     <div key={i} className="flex items-start ml-2 mb-3">
                                         <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-4 mt-2.5 flex-shrink-0" />
                                         <span className="text-slate-700">{formatInlineStyles(trimmedLine.replace(/^[-*•]\s*/, ''))}</span>
                                     </div>
                                 );
                            }
                            
                            // Numbered Lists
                            if (/^\d+\.\s/.test(trimmedLine)) {
                                 return (
                                     <div key={i} className="flex items-start ml-2 mb-3">
                                         <span className="text-rose-600 font-bold mr-3 min-w-[1.2em]">{trimmedLine.split('.')[0]}.</span>
                                         <span className="text-slate-700">{formatInlineStyles(trimmedLine.replace(/^\d+\.\s*/, ''))}</span>
                                     </div>
                                 );
                            }

                            // Blockquotes
                            if (trimmedLine.startsWith('>')) {
                                return (
                                    <div key={i} className="relative p-10 my-12 overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 group">
                                         <div className="absolute top-4 left-4 text-rose-200 text-6xl font-serif opacity-50 select-none">“</div>
                                         <p className="relative z-10 text-xl font-serif italic text-slate-800 leading-relaxed">
                                            {formatInlineStyles(trimmedLine.substring(1).trim())}
                                         </p>
                                    </div>
                                );
                            }

                            // Paragraph
                            return <p key={i} className="mb-4">{formatInlineStyles(trimmedLine)}</p>;
                        })}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const formatInlineStyles = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-950 decoration-rose-200 underline-offset-4 decoration-2">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const ArticleView: React.FC<ArticleViewProps> = ({ post, user, onBack, onUnlock, onLoginRequest }) => {
  const hasAccess = !post.isPremium || (user && user.purchasedContentIds.includes(post.id)) || (user && user.isSubscriber);
  const isCourse = post.type === 'course';
  const [showShareModal, setShowShareModal] = useState(false);

  // Group blocks for courses logic
  const courseSections = useMemo(() => {
    if (!isCourse) return [post.blocks]; 
    const sections: ContentBlock[][] = [];
    let currentSection: ContentBlock[] = [];
    post.blocks.forEach((block) => {
        const isModuleHeader = block.type === 'header' && (block.content.includes('Week') || block.content.includes('Module') || block.content.includes('Conclusion'));
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
          return idx === 0 ? "Introduction" : `Module ${idx}`;
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

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url: window.location.href }); } catch (err) {}
    } else { setShowShareModal(true); }
  };

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {isCourse && hasAccess && (
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl border-b border-rose-100 shadow-sm px-6 py-4 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-6">
                  <div className="flex items-center text-rose-600 font-black uppercase tracking-widest text-[10px]">
                     <Map size={14} className="mr-2" />
                     <span>Your Roadmap</span>
                  </div>
                  <div className="hidden md:block w-64 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-rose-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,63,94,0.4)]" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
              </div>
              <div className="text-xs font-bold text-slate-500">
                  <span className="text-rose-600">{progressPercentage}%</span> Journey Completed
              </div>
          </div>
      )}

      <ParallaxHeader imageUrl={post.coverImage}>
        <div className="absolute top-8 left-8 z-20">
          <button onClick={onBack} className="flex items-center space-x-2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-6 py-2.5 rounded-full transition-all border border-white/10">
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Return</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-16 max-w-4xl mx-auto text-center text-white">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-6 shadow-xl shadow-rose-900/20">{post.type}</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">{post.title}</h1>
            <p className="text-lg md:text-2xl text-slate-100 mb-8 font-light max-w-2xl mx-auto leading-relaxed opacity-90">{post.subtitle}</p>
          </FadeIn>
        </div>
      </ParallaxHeader>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {courseSections.map((section, sectionIndex) => {
            if (!hasAccess && post.isPremium && sectionIndex > 0) {
                if (sectionIndex === 1) {
                    return (
                        <FadeIn key="paywall" className="relative mt-12 p-16 bg-gradient-to-br from-rose-50 to-white rounded-[3rem] border border-rose-100 text-center overflow-hidden shadow-2xl">
                            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3 shadow-lg">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Complete Your Journey</h3>
                            <p className="text-slate-600 mb-10 max-w-sm mx-auto">This specialized material is part of our premium catalog. Unlock full access to continue.</p>
                            <button onClick={onUnlock} className="bg-rose-600 text-white px-10 py-4 rounded-full font-bold hover:bg-rose-700 transition-all hover:scale-105 shadow-xl shadow-rose-900/20">
                                Unlock Now for ${post.price || '9.99'}
                            </button>
                        </FadeIn>
                    );
                }
                return null;
            }

            return (
                <div key={sectionIndex} id={`section-${sectionIndex}`} className="mb-20 scroll-mt-40">
                    {section.map((block) => {
                        switch(block.type) {
                            case 'header':
                                return <FadeIn key={block.id}><h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-16 mb-8 leading-tight">{block.content}</h2></FadeIn>;
                            case 'text':
                                return <FadeIn key={block.id} className="mb-10"><RichTextRenderer content={block.content} /></FadeIn>;
                            case 'quote':
                                return (
                                    <FadeIn key={block.id}>
                                        <div className="relative p-12 my-16 overflow-hidden rounded-[2.5rem] bg-rose-50/50 border border-rose-100">
                                             <div className="absolute top-4 left-6 text-rose-200 text-7xl font-serif opacity-50 select-none">“</div>
                                             <p className="relative z-10 text-2xl font-serif italic text-slate-800 leading-relaxed text-center">
                                                {block.content}
                                             </p>
                                        </div>
                                    </FadeIn>
                                );
                            case 'image':
                                return (
                                    <FadeIn key={block.id}>
                                        <figure className="my-12">
                                            <img src={block.content} alt="Visual Content" className="w-full rounded-[2rem] shadow-2xl border border-slate-100" />
                                            {block.meta?.caption && <figcaption className="text-center text-slate-400 text-xs mt-4 italic">{block.meta.caption}</figcaption>}
                                        </figure>
                                    </FadeIn>
                                );
                            case 'agent':
                                return <FadeIn key={block.id}><ExpertEmbed agentIdOrSlug={block.meta?.agentId || ''} /></FadeIn>;
                            default: return null;
                        }
                    })}

                    {isCourse && hasAccess && sectionIndex === completedSections && sectionIndex < courseSections.length - 1 && (
                        <FadeIn className="mt-16 p-12 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center shadow-lg shadow-emerald-900/5">
                             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                                 <CheckCircle size={32} />
                             </div>
                             <h4 className="text-xl font-bold text-slate-900 mb-2">Step Complete!</h4>
                             <p className="text-slate-600 mb-8 max-w-xs">You've mastered this module. Ready to dive into the next chapter?</p>
                             <button onClick={handleCompleteSection} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-emerald-900/10 transition-all hover:-translate-y-1">
                                 Advance to {sectionTitles[sectionIndex + 1]}
                             </button>
                        </FadeIn>
                    )}
                </div>
            );
        })}

        <div className="mt-20 flex justify-between items-center pt-10 border-t border-slate-100">
          <div className="flex items-center space-x-4">
             <img src={post.author.avatar} className="w-12 h-12 rounded-full border-2 border-rose-100 shadow-sm" alt={post.author.name} />
             <div>
                 <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Author</p>
                 <p className="text-sm font-bold text-slate-800">{post.author.name}</p>
             </div>
          </div>
          <button onClick={handleShare} className="group flex items-center space-x-3 bg-slate-50 text-slate-600 px-8 py-4 rounded-full font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm hover:shadow-rose-900/20">
            <Share2 size={18} />
            <span>Spread the Knowledge</span>
          </button>
        </div>
      </article>
    </div>
  );
};

export default ArticleView;
