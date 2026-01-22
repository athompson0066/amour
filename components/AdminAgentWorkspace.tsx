import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Rocket, FileText, BookOpen, Send, Loader2, ArrowLeft, Terminal, User, ChevronRight, CheckCircle2, ShieldAlert, Mail, Map, Cpu, Headphones, List, Book, MessageSquare, Image as ImageIcon, CircleDollarSign, Lock, Youtube, Video } from 'lucide-react';
import { runCrewMission } from '../services/geminiService';
import { savePost, DEFAULT_AUTHOR } from '../services/storage';
import { fetchVideos } from '../services/youtubeService';
import { Post, ContentType, VideoItem } from '../types';
import { FadeIn } from './Animated';

interface AdminAgentWorkspaceProps {
  onBack: () => void;
  onPublished: () => void;
}

const CREW_MEMBERS = [
  { id: 'strategist', name: 'The Strategist', role: 'Psychology Researcher', icon: <BrainCircuit className="text-blue-500" />, color: 'bg-blue-50 border-blue-200' },
  { id: 'wordsmith', name: 'The Wordsmith', role: 'Premium Copywriter', icon: <FileText className="text-purple-500" />, color: 'bg-purple-50 border-purple-200' },
  { id: 'editor', name: 'The Editor', role: 'Content Quality Control', icon: <ShieldAlert className="text-emerald-500" />, color: 'bg-emerald-50 border-emerald-200' }
];

const OPERATION_TYPES: { id: ContentType; label: string; icon: React.ReactNode }[] = [
  { id: 'course', label: 'Online Course', icon: <BookOpen size={14} /> },
  { id: 'newsletter', label: 'Ezine/Newsletter', icon: <Mail size={14} /> },
  { id: 'article', label: 'Blog Article', icon: <FileText size={14} /> },
  { id: 'guide', label: 'How-To Guide', icon: <Map size={14} /> },
  { id: 'tutorial', label: 'Technical Tutorial', icon: <Cpu size={14} /> },
  { id: 'ebook', label: 'PDF E-Book', icon: <Book size={14} /> },
  { id: 'podcast', label: 'Podcast Series', icon: <Headphones size={14} /> },
  { id: 'listicle', label: 'Viral Listicle', icon: <List size={14} /> },
  { id: 'app', label: 'Custom AI Agent', icon: <Sparkles size={14} /> }
];

const AdminAgentWorkspace: React.FC<AdminAgentWorkspaceProps> = ({ onBack, onPublished }) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [featureImageUrl, setFeatureImageUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('19.99');
  const [includeVideos, setIncludeVideos] = useState(false);
  const [videoCount, setVideoCount] = useState(3);
  const [selectedOp, setSelectedOp] = useState<ContentType>('article');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [missionLog, setMissionLog] = useState<string[]>([]);
  const [draftResult, setDraftResult] = useState<Post | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const steps = [
    { name: 'Researching Depth', agent: 'The Strategist' },
    { name: 'Drafting Content', agent: 'The Wordsmith' },
    { name: 'Refining Quality', agent: 'The Editor' }
  ];

  const handleRunMission = async () => {
    if (!title) return;
    setIsRunning(true);
    setDraftResult(null);
    setCurrentStep(0);
    setMissionLog(["Initializing Mission: " + title]);

    // Step 1: Strategist
    await new Promise(r => setTimeout(r, 1000));
    setMissionLog(prev => [...prev, "Strategist: Identifying psychological anchors..."]);
    setCurrentStep(1);

    // Step 2: Wordsmith
    await new Promise(r => setTimeout(r, 1000));
    setMissionLog(prev => [...prev, `Wordsmith: Crafting narrative for ${selectedOp}...`]);
    setCurrentStep(2);

    try {
        const finalPrice = isPremium ? parseFloat(price) : 0;
        const result = await runCrewMission(title, selectedOp, instructions, featureImageUrl, isPremium, finalPrice, includeVideos ? videoCount : 0);
        
        if (result) {
            let finalCoverImage = featureImageUrl || result.coverImage;
            if (!finalCoverImage || finalCoverImage.includes('...')) {
                finalCoverImage = `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200&h=600`;
            }

            // Optional: Fetch real YouTube videos if AI suggested search queries
            let actualVideos: VideoItem[] = [];
            if (result.youtubeSearchQueries && Array.isArray(result.youtubeSearchQueries)) {
                setMissionLog(prev => [...prev, `Crew: Retrieving ${result.youtubeSearchQueries.length} matching YouTube resources...`]);
                const videoPromises = result.youtubeSearchQueries.map((query: string) => fetchVideos(query));
                const videoResults = await Promise.all(videoPromises);
                actualVideos = videoResults.map(res => res[0]).filter(v => !!v);
            }

            // CRITICAL: Explicitly map all required Post fields
            const finalizedPost: Post = {
                ...result,
                id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: selectedOp,
                author: result.author || DEFAULT_AUTHOR,
                publishedAt: new Date().toISOString(),
                readTime: result.readTime || (selectedOp === 'course' ? '4 Week Course' : '8 min read'),
                tags: result.tags || title.split(' ').filter(word => word.length > 3).slice(0, 3),
                coverImage: finalCoverImage, 
                isPremium: isPremium,
                price: finalPrice,
                relatedVideos: actualVideos.length > 0 ? actualVideos : undefined,
                blocks: result.blocks.map((b: any) => ({
                    ...b,
                    id: b.id && b.id.length > 5 ? b.id : `block_${Math.random().toString(36).substr(2, 9)}`
                }))
            };
            setMissionLog(prev => [...prev, "Editor: Final check complete. Draft ready."]);
            setDraftResult(finalizedPost);
        } else {
            setMissionLog(prev => [...prev, "Mission Failed: Content Engine returned empty result."]);
        }
    } catch (e) {
        setMissionLog(prev => [...prev, "Error: Communication with agents lost."]);
    } finally {
        setIsRunning(false);
    }
  };

  const handlePublish = async () => {
    if (!draftResult) return;
    setIsPublishing(true);
    setMissionLog(prev => [...prev, "Publishing: Syncing with the cloud veil..."]);
    try {
        await savePost(draftResult);
        setMissionLog(prev => [...prev, "SUCCESS: Content is now live in the directory."]);
        await new Promise(r => setTimeout(r, 800)); // Brief pause for user to read success
        onPublished();
        onBack();
    } catch (e: any) {
        console.error("Publishing error:", e);
        setMissionLog(prev => [...prev, `FAILURE: ${e.message || "Unknown error during sync."}`]);
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold flex items-center">
                <Terminal className="mr-2 text-rose-500" size={20} />
                Agent Command Center
            </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <FadeIn>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Rocket className="mr-2 text-rose-400" size={18} />
                        Mission Config
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Content Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. How to Build Long-Term Trust"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Agent Instructions</label>
                            <textarea 
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="e.g. Focus on attachment theory. Use a humorous but empathetic tone."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none h-24"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Featured Image URL</label>
                            <input 
                                type="text"
                                value={featureImageUrl}
                                onChange={(e) => setFeatureImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-red-900/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Youtube size={16} className="text-red-500" />
                                    <label className="text-xs font-bold text-slate-300 uppercase">YouTube Videos</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={includeVideos} onChange={(e) => setIncludeVideos(e.target.checked)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                            <AnimatePresence>
                                {includeVideos && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="pt-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Number of Videos</label>
                                            <input type="number" min="1" max="10" value={videoCount} onChange={(e) => setVideoCount(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-amber-900/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <CircleDollarSign size={16} className="text-amber-500" />
                                    <label className="text-xs font-bold text-slate-300 uppercase">Monetization</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                            <AnimatePresence>
                                {isPremium && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="pt-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 font-mono text-sm">$</span>
                                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none" step="0.01" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Operation Type</label>
                            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                {OPERATION_TYPES.map(op => (
                                    <button key={op.id} onClick={() => setSelectedOp(op.id)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${selectedOp === op.id ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                        <span className={selectedOp === op.id ? 'text-white' : 'text-rose-400'}>{op.icon}</span>
                                        <span>{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleRunMission} disabled={!title || isRunning} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-900/40 transition-all flex items-center justify-center disabled:opacity-50">
                            {isRunning ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            Run Crew Mission
                        </button>
                    </div>
                </div>
            </FadeIn>
        </div>

        <div className="lg:col-span-8 space-y-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-mono text-rose-500 font-bold">LIVE_ORCHESTRATION_LOG</h3>
                    </div>
                </div>
                <div className="flex-grow space-y-2 font-mono text-xs text-slate-400 overflow-y-auto max-h-[250px] custom-scrollbar">
                    {missionLog.map((log, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-start">
                            <span className="text-slate-600 mr-2">{">"}</span>
                            {log}
                        </motion.div>
                    ))}
                    {isRunning && <div className="flex items-center text-rose-400"><span className="text-slate-600 mr-2">{">"}</span>Processing: {steps[currentStep].name}...</div>}
                </div>
                {isRunning && (
                    <div className="mt-8">
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-rose-500" initial={{ width: '0%' }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {draftResult && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white">
                        <div className="aspect-[21/9] bg-slate-200 relative">
                             <img src={draftResult.coverImage} className="w-full h-full object-cover" alt="Preview" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <h1 className="text-3xl font-serif font-bold text-white mb-2">{draftResult.title}</h1>
                             </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2"><CheckCircle2 className="text-emerald-500" size={20} /><span className="text-sm font-bold text-slate-500 uppercase">Draft Ready</span></div>
                                </div>
                                <button onClick={handlePublish} disabled={isPublishing} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center">
                                    {isPublishing ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2" size={18} />}
                                    Publish
                                </button>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar text-slate-700">
                                {draftResult.blocks.slice(0, 3).map(block => (
                                    <div key={block.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{block.type}</div>
                                        <div className="text-sm">{block.content}</div>
                                    </div>
                                ))}
                                <div className="text-center text-slate-400 italic text-xs">... and {draftResult.blocks.length - 3} more blocks generated</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminAgentWorkspace;