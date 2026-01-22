
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
        // Only show error in a subtle way to avoid breaking the reading flow
        return (
            <div className="my-6 p-4 border border-dashed border-slate-200 rounded-xl flex items-center text-slate-400 text-xs italic">
                <AlertTriangle size={14} className="mr-2" />
                Expert reference "{agentIdOrSlug}" not found in directory.
            </div>
        );
    }

    return (
        <div className="my-10 relative">
            <div className="p-8 bg-gradient-to-br from-white to-rose-50/50 rounded-3xl border border-rose-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <img src={agent.avatar} className="w-full h-full object-cover" />
                    </div>
                    {agent.isOnline && (
                        <div className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-green-500 border-[3px] border-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-2xl font-serif font-bold text-slate-900">{agent.name}</h4>
                        <span className="hidden md:inline text-slate-200 text-xl">|</span>
                        <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">{agent.role}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xl line-clamp-2">
                        {agent.description}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button 
                            onClick={() => setActiveMode('chat')}
                            className="group flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <MessageSquare size={16} />
                            <span>Ask for Advice</span>
                        </button>
                        <button 
                            onClick={() => setActiveMode('voice')}
                            className="group flex items-center space-x-2 bg-white border border-rose-200 text-rose-600 px-6 py-3 rounded-full text-xs font-bold hover:bg-rose-50 transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Phone size={16} className="fill-current" />
                            <span>Voice Call</span>
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
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                        >
                            <button 
                                onClick={() => setActiveMode('none')}
                                className="absolute top-4 right-4 z-[110] p-2 bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white rounded-full transition-all"
                            >
                                <X size={20} />
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

// Enhanced Text Renderer with Shortcode Support
const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
    // 1. Identify all current agent slugs to handle un-bracketed references on their own lines
    const allAgents = [...getAgents(), ...getAstroAgents()];
    const agentSlugs = allAgents.map(a => a.embedCode).filter(Boolean) as string[];

    // 2. Prepare the content: detect if a known slug is on its own line without brackets
    let processedContent = content;
    agentSlugs.forEach(slug => {
        // This regex looks for the slug if it's the only thing on a line
        const standaloneRegex = new RegExp(`(^|\\n)(${slug})(\\n|$)`, 'g');
        processedContent = processedContent.replace(standaloneRegex, `$1[$2]$3`);
    });

    // 3. Regex to find shortcodes: [agent:ID] or [custom-slug]
    const shortcodeRegex = /\[(agent:[^\]\s]+|[^\]\s]+)\]/g;
    
    // Split content by shortcodes while keeping the delimiters
    const parts = processedContent.split(shortcodeRegex);
    
    return (
        <div className="space-y-3 text-lg text-slate-700 leading-relaxed font-light">
            {parts.map((part, index) => {
                // If this part matches a shortcode identifier
                if (index % 2 === 1) {
                    const cleanSlug = part.startsWith('agent:') ? part.replace('agent:', '') : part;
                    return <ExpertEmbed key={index} agentIdOrSlug={cleanSlug} />;
                }

                // Standard formatting for non-shortcode text
                const lines = part.split('\n');
                return (
                    <React.Fragment key={index}>
                        {lines.map((line, i) => {
                            const trimmed = line.trim();
                            if (!trimmed) return <br key={i} />;

                            // Headers
                            if (trimmed.startsWith('### Key Concept')) {
                                return (
                                    <div key={i} className="flex items-center space-x-3 text-xl font-bold text-amber-700 bg-amber-50 p-4 rounded-xl mt-8 mb-4 border border-amber-100">
                                        <div className="p-2 bg-white rounded-full shadow-sm"><Lightbulb className="text-amber-500 w-5 h-5" /></div>
                                        <span>{trimmed.replace(/#/g, '').replace('Key Concept', '').trim() || 'Key Concept'}</span>
                                    </div>
                                );
                            }
                            if (trimmed.startsWith('### Action Steps')) {
                                return (
                                    <div key={i} className="flex items-center space-x-3 text-xl font-bold text-emerald-700 bg-emerald-50 p-4 rounded-xl mt-8 mb-4 border border-emerald-100">
                                        <div className="p-2 bg-white rounded-full shadow-sm"><ListChecks className="text-emerald-500 w-5 h-5" /></div>
                                        <span>{trimmed.replace(/#/g, '').replace('Action Steps', '').trim() || 'Action Steps'}</span>
                                    </div>
                                );
                            }
                            if (trimmed.startsWith('###')) {
                                return <h3 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-3">{formatInlineStyles(trimmed.replace(/#/g, '').trim())}</h3>;
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
                            
                            // Blockquotes
                            if (trimmed.startsWith('>')) {
                                return (
                                    <div key={i} className="bg-rose-50 border-l-4 border-rose-400 p-5 my-6 rounded-r-xl italic text-slate-800 text-lg">
                                         {formatInlineStyles(trimmed.substring(1).trim())}
                                    </div>
                                );
                            }

                            return <p key={i} className="mb-2">{formatInlineStyles(trimmed)}</p>;
                        })}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

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
  const [showShareModal, setShowShareModal] = useState(false);

  // Group blocks for courses
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

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url: window.location.href }); } catch (err) {}
    } else { setShowShareModal(true); }
  };

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {isCourse && hasAccess && (
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-rose-100 shadow-sm px-6 py-3 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-4">
                  <div className="flex items-center text-rose-600 font-bold uppercase tracking-wider text-xs">
                     <Map size={14} className="mr-2" />
                     <span>Progress</span>
                  </div>
                  <div className="hidden md:block w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
              </div>
              <div className="text-xs font-medium text-slate-500">
                  <span className="text-rose-600 font-bold">{progressPercentage}%</span> Complete
              </div>
          </div>
      )}

      <ParallaxHeader imageUrl={post.coverImage}>
        <div className="absolute top-6 left-6 z-20">
          <button onClick={onBack} className="flex items-center space-x-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full transition-all">
            <ArrowLeft size={18} />
            <span>Back to Directory</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12 max-w-4xl mx-auto text-center text-white">
          <FadeIn>
            <span className="inline-block px-3 py-1 bg-rose-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">{post.type}</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg md:text-xl text-slate-200 mb-6 font-light max-w-2xl mx-auto">{post.subtitle}</p>
          </FadeIn>
        </div>
      </ParallaxHeader>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {courseSections.map((section, sectionIndex) => {
            if (!hasAccess && post.isPremium && sectionIndex > 0) {
                if (sectionIndex === 1) {
                    return (
                        <FadeIn key="paywall" className="relative mt-8 p-12 bg-rose-50 rounded-3xl border border-rose-100 text-center overflow-hidden shadow-sm">
                            <Lock className="text-rose-500 w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Unlock Full Access</h3>
                            <button onClick={onUnlock} className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition-transform hover:scale-105 shadow-lg mt-6">
                                Unlock for ${post.price || '9.99'}
                            </button>
                        </FadeIn>
                    );
                }
                return null;
            }

            return (
                <div key={sectionIndex} id={`section-${sectionIndex}`} className="mb-16 scroll-mt-32">
                    {section.map((block) => {
                        switch(block.type) {
                            case 'header':
                                return <FadeIn key={block.id}><h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-12 mb-4">{block.content}</h2></FadeIn>;
                            case 'text':
                                return <FadeIn key={block.id} className="mb-8"><RichTextRenderer content={block.content} /></FadeIn>;
                            case 'quote':
                                return <FadeIn key={block.id}><blockquote className="border-l-4 border-rose-400 pl-6 py-4 my-10 italic text-xl text-slate-800 bg-slate-50 rounded-r-lg shadow-sm">"{block.content}"</blockquote></FadeIn>;
                            case 'image':
                                return <FadeIn key={block.id}><img src={block.content} alt="Content" className="w-full rounded-xl shadow-md my-8" /></FadeIn>;
                            case 'agent':
                                return <FadeIn key={block.id}><ExpertEmbed agentIdOrSlug={block.meta?.agentId || ''} /></FadeIn>;
                            default: return null;
                        }
                    })}

                    {isCourse && hasAccess && sectionIndex === completedSections && sectionIndex < courseSections.length - 1 && (
                        <FadeIn className="mt-12 p-8 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center">
                             <CheckCircle className="text-green-600 w-12 h-12 mb-4" />
                             <button onClick={handleCompleteSection} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all">
                                 Complete {sectionTitles[sectionIndex]} & Continue
                             </button>
                        </FadeIn>
                    )}
                </div>
            );
        })}

        <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-200">
          <button onClick={handleShare} className="group flex items-center space-x-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-full font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm">
            <Share2 size={18} />
            <span>Share Resource</span>
          </button>
        </div>
      </article>
    </div>
  );
};

export default ArticleView;
