
import React, { useState, useEffect } from 'react';
import { Plus, Image, Type, Save, X, Trash2, Layout, DollarSign, Sparkles, BookOpen, AlertCircle, Loader2, UserCheck, ExternalLink, Youtube, Search, Video, RefreshCw, PlayCircle, ChevronUp, ChevronDown, CheckCircle2, ListChecks, Code, FileDown, Key, CircleDollarSign } from 'lucide-react';
import { Post, ContentBlock, ContentType, Agent, VideoItem, QuizQuestion } from '../types';
import { savePost, getAgents, getAstroAgents } from '../services/storage';
import { generateBlogOutline, generateCourseStructure } from '../services/geminiService';
import { fetchVideos } from '../services/youtubeService';

interface AdminEditorProps {
  onCancel: () => void;
  onSave: () => void;
  initialPost?: Post;
}

const AdminEditor: React.FC<AdminEditorProps> = ({ onCancel, onSave, initialPost }) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle || '');
  const [type, setType] = useState<ContentType>(initialPost?.type || 'article');
  const [isPremium, setIsPremium] = useState(initialPost?.isPremium || false);
  const [price, setPrice] = useState<number>(initialPost?.price || 0);
  const [payhipUrl, setPayhipUrl] = useState(initialPost?.payhipProductUrl || '');
  const [unlockPassword, setUnlockPassword] = useState(initialPost?.unlockPassword || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialPost?.blocks || []);
  const [relatedVideos, setRelatedVideos] = useState<VideoItem[]>(initialPost?.relatedVideos || []);
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || `https://picsum.photos/seed/${Date.now()}/800/400`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState(initialPost?.tags.join(', ') || '');
  
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTopic, setCourseTopic] = useState('');
  const [courseAudience, setCourseAudience] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const agents = [...getAgents(), ...getAstroAgents()];
    setAvailableAgents(agents);
  }, []);

  const addBlock = (type: ContentBlock['type'], content: string = '', meta: any = {}) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      meta: type === 'header' ? { level: 'h2', ...meta } : (type === 'quiz' ? { questions: [], ...meta } : meta)
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string, meta?: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content, meta: { ...b.meta, ...meta } } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const addQuestionToQuiz = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.meta) return;
    const questions = [...(block.meta.questions || [])];
    questions.push({
        question: "New Question",
        options: ["Option 1", "Option 2"],
        correctAnswerIndex: 0
    });
    updateBlock(blockId, block.content, { questions });
  };

  const updateQuizQuestion = (blockId: string, qIndex: number, field: keyof QuizQuestion, value: any) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.meta) return;
    const questions = [...(block.meta.questions || [])];
    questions[qIndex] = { ...questions[qIndex], [field]: value };
    updateBlock(blockId, block.content, { questions });
  };

  const removeQuestionFromQuiz = (blockId: string, qIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.meta) return;
    const questions = block.meta.questions?.filter((_: any, i: number) => i !== qIndex);
    updateBlock(blockId, block.content, { questions });
  };

  const handleMagicFetchVideos = async () => {
      if (!title) return alert("Enter a title first so we know what to search for.");
      setIsFetchingVideos(true);
      try {
          const results = await fetchVideos(title);
          setRelatedVideos(results.slice(0, 6));
      } catch (err) {
          console.error(err);
      } finally {
          setIsFetchingVideos(false);
      }
  };

  const removeRelatedVideo = (id: string) => {
      setRelatedVideos(relatedVideos.filter(v => v.id !== id));
  };

  const handleGenerateCourse = async () => {
    if (!courseTopic) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
        const data = await generateCourseStructure(courseTopic, courseAudience || 'general audience', courseDescription);
        
        if (data) {
            setTitle(data.title || courseTopic);
            setSubtitle(data.subtitle || '');
            setTags(data.tags ? data.tags.join(', ') : '');
            setType('course');
            setIsPremium(true);
            if (data.price) setPrice(data.price);
            
            if (data.blocks && Array.isArray(data.blocks)) {
                 const newBlocks = data.blocks.map((b: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    type: b.type,
                    content: b.content,
                    meta: b.meta
                }));
                setBlocks(newBlocks);
            }
            setShowCourseModal(false);
        } else {
            setGenerationError("Failed to generate course.");
        }
    } catch (e) {
        console.error(e);
        setGenerationError("An unexpected error occurred.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleEmbedAgent = (agent: Agent) => {
      addBlock('agent', `Embedded Expert: ${agent.name}`, { agentId: agent.id });
      setShowAgentModal(false);
  };

  const handleSave = async () => {
    if (!title) return alert("Title is required");
    
    setIsSaving(true);
    try {
        const newPost: Post = {
          id: initialPost?.id || Math.random().toString(36).substr(2, 9),
          title,
          subtitle,
          type,
          coverImage,
          author: initialPost?.author || {
            id: 'admin',
            name: 'Admin Editor',
            avatar: 'https://picsum.photos/seed/admin/100/100',
            bio: 'Site Administrator'
          },
          publishedAt: initialPost?.publishedAt || new Date().toISOString(),
          readTime: type === 'course' ? '4 Week Course' : '5 min read',
          isPremium,
          price: isPremium ? price : undefined,
          payhipProductUrl: isPremium ? payhipUrl : undefined,
          unlockPassword: isPremium ? unlockPassword : undefined,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          blocks,
          relatedVideos: relatedVideos.length > 0 ? relatedVideos : undefined
        };
        
        await savePost(newPost);
        onSave();
    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save post.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {showCourseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-rose-100">
                <div className="p-6 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-rose-900 flex items-center">
                        <Sparkles className="mr-2 text-rose-500" />
                        AI Course Creator
                    </h3>
                    <button onClick={() => setShowCourseModal(false)} className="text-rose-400 hover:text-rose-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-slate-600 text-sm">Describe your course idea and let AI draft the syllabus.</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                        <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20" value={courseTopic} onChange={(e) => setCourseTopic(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Draft Outline</label>
                        <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-rose-500/20" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                    <button onClick={handleGenerateCourse} disabled={isGenerating} className="px-6 py-2 bg-rose-600 text-white rounded-full font-bold shadow-md">
                        {isGenerating ? "Writing..." : "Generate Course"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {showAgentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">Select Expert to Embed</h3>
                      <button onClick={() => setShowAgentModal(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                      {availableAgents.map(agent => (
                          <button 
                            key={agent.id} 
                            onClick={() => handleEmbedAgent(agent)}
                            className="w-full flex items-center p-4 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                          >
                              <img src={agent.avatar} className="w-12 h-12 rounded-full object-cover mr-4 shadow-sm border-2 border-white group-hover:scale-105 transition-transform" />
                              <div className="text-left">
                                  <div className="font-bold text-sm text-slate-900">{agent.name}</div>
                                  <div className="text-[10px] text-rose-500 uppercase font-black tracking-widest">{agent.role}</div>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <div className="p-2 bg-rose-50 rounded-lg mr-3"><Layout className="text-rose-500" size={20} /></div>
            {initialPost ? 'Update Content' : 'Draft New Experience'}
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowCourseModal(true)} className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all text-sm font-bold">
              <Sparkles size={16} />
              <span>AI Course Generator</span>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button onClick={onCancel} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center font-bold disabled:opacity-70 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Publish to Directory
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Post Foundation</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Enter a captivating title..."
                            className="w-full px-0 border-none focus:ring-0 text-4xl font-serif font-bold text-slate-900 placeholder-slate-200" 
                        />
                        <textarea 
                            value={subtitle} 
                            onChange={(e) => setSubtitle(e.target.value)} 
                            placeholder="Add an enticing subtitle that hooks the reader..."
                            className="w-full px-0 border-none focus:ring-0 text-xl text-slate-500 h-24 resize-none placeholder-slate-200 font-light" 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative bg-white p-6 rounded-3xl border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/5 transition-all duration-300">
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 z-10 scale-90 origin-top-right">
                            <div className="flex flex-col space-y-1 mr-1">
                                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 bg-white shadow-lg text-slate-400 hover:text-indigo-600 rounded-full transition-colors border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp size={14}/></button>
                                <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 bg-white shadow-lg text-slate-400 hover:text-indigo-600 rounded-full transition-colors border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown size={14}/></button>
                            </div>
                            <button onClick={() => removeBlock(block.id)} className="p-2.5 bg-white shadow-lg text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-100"><Trash2 size={16}/></button>
                        </div>
                        {block.type === 'header' && <input className="w-full font-serif font-bold text-slate-900 border-none outline-none focus:ring-0 text-2xl" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} placeholder="Section Header" />}
                        {block.type === 'text' && <textarea className="w-full resize-none min-h-[120px] border-none outline-none focus:ring-0 text-slate-700 text-lg font-light leading-relaxed" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} placeholder="Write your narrative..." />}
                        {block.type === 'image' && (
                            <div className="space-y-3">
                                <input className="w-full text-xs font-mono bg-slate-50 rounded-xl px-4 py-3 border border-slate-200" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} placeholder="Image URL" />
                                {block.content && <img src={block.content} className="w-full rounded-2xl h-48 object-cover border border-slate-100 shadow-inner" />}
                            </div>
                        )}
                        {block.type === 'video' && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2"><Youtube className="text-red-600" size={16} /><input className="flex-grow text-xs font-mono bg-slate-50 rounded-xl px-4 py-3 border border-slate-200" value={block.meta?.videoId || ''} onChange={(e) => updateBlock(block.id, block.content, { videoId: e.target.value })} placeholder="YouTube Video ID" /></div>
                                {block.meta?.videoId && <div className="aspect-video w-full rounded-2xl bg-slate-900 flex items-center justify-center text-white/20"><PlayCircle size={48} /></div>}
                            </div>
                        )}
                        {block.type === 'agent' && (
                            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-center shadow-inner">
                                <div className="p-3 bg-white rounded-xl mr-4 shadow-sm"><UserCheck className="text-rose-500" /></div>
                                <div><span className="font-bold text-slate-900 block">{block.content}</span><span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Interactive Expert Component</span></div>
                            </div>
                        )}
                        {block.type === 'quiz' && (
                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-inner space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2"><div className="p-2 bg-indigo-600 rounded-lg text-white"><ListChecks size={18} /></div><h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Module Quiz</h4></div>
                                    <button onClick={() => addQuestionToQuiz(block.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm"><Plus size={14} className="mr-1" /> Add Question</button>
                                </div>
                                <div className="space-y-6">
                                    {block.meta?.questions?.map((q: QuizQuestion, qIdx: number) => (
                                        <div key={qIdx} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative group/q">
                                            <button onClick={() => removeQuestionFromQuiz(block.id, qIdx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                            <div className="mb-4"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Question {qIdx + 1}</label><input type="text" value={q.question} onChange={(e) => updateQuizQuestion(block.id, qIdx, 'question', e.target.value)} className="w-full text-sm font-bold text-slate-900 border-b border-slate-100 focus:border-indigo-500 outline-none pb-1" /></div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Options & Answer</label>
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center space-x-3">
                                                        <input type="radio" name={`correct-${block.id}-${qIdx}`} checked={q.correctAnswerIndex === oIdx} onChange={() => updateQuizQuestion(block.id, qIdx, 'correctAnswerIndex', oIdx)} className="w-4 h-4 text-indigo-600" />
                                                        <input type="text" value={opt} onChange={(e) => { const newOptions = [...q.options]; newOptions[oIdx] = e.target.value; updateQuizQuestion(block.id, qIdx, 'options', newOptions); }} className={`flex-grow text-xs px-3 py-2 rounded-lg border outline-none transition-all ${q.correctAnswerIndex === oIdx ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-100'}`} />
                                                        {q.options.length > 2 && <button onClick={() => { const newOptions = q.options.filter((_, i) => i !== oIdx); updateQuizQuestion(block.id, qIdx, 'options', newOptions); }} className="p-1.5 text-slate-300 hover:text-red-400"><X size={12} /></button>}
                                                    </div>
                                                ))}
                                                <button onClick={() => { const newOptions = [...q.options, `Option ${q.options.length + 1}`]; updateQuizQuestion(block.id, qIdx, 'options', newOptions); }} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 mt-2 flex items-center"><Plus size={10} className="mr-1" /> Add Option</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {block.type === 'embed' && <div className="space-y-3"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-2 text-indigo-600"><Code size={18} /><span className="text-xs font-black uppercase tracking-widest">Custom Embed</span></div></div><textarea className="w-full font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl px-4 py-4 border border-slate-700 h-32" value={block.meta?.html || ''} onChange={(e) => updateBlock(block.id, block.content, { html: e.target.value })} placeholder="<iframe>...</iframe>" /></div>}
                        {block.type === 'pdf' && <div className="space-y-4"><div className="flex items-center space-x-2 text-rose-600 mb-2"><FileDown size={18} /><span className="text-xs font-black uppercase tracking-widest">PDF Widget</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><input className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg outline-none" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} placeholder="Button Label" /></div><div><input className="w-full text-sm px-4 py-2 border border-slate-200 rounded-lg outline-none" value={block.meta?.url || ''} onChange={(e) => updateBlock(block.id, block.content, { url: e.target.value })} placeholder="PDF URL" /></div></div></div>}
                    </div>
                ))}
                <div className="flex justify-center flex-wrap gap-4 py-12 border-t-2 border-slate-200 mt-12 border-dashed">
                    <button onClick={() => addBlock('header')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-rose-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><Type size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Header</span></button>
                    <button onClick={() => addBlock('text')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-rose-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><Layout size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Text</span></button>
                    <button onClick={() => addBlock('video')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-red-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><Video size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Video</span></button>
                    <button onClick={() => addBlock('image')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-rose-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><Image size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Image</span></button>
                    <button onClick={() => setShowAgentModal(true)} className="group flex flex-col items-center p-4 text-slate-500 hover:text-indigo-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><UserCheck size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Expert</span></button>
                    <button onClick={() => addBlock('quiz')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-indigo-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><ListChecks size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Quiz</span></button>
                    <button onClick={() => addBlock('embed')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-indigo-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><Code size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">Embed</span></button>
                    <button onClick={() => addBlock('pdf')} className="group flex flex-col items-center p-4 text-slate-500 hover:text-rose-600 transition-all"><div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2"><FileDown size={20} /></div><span className="text-[10px] font-black uppercase tracking-widest">PDF</span></button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center"><RefreshCw className="mr-2 text-rose-500" size={14} />Configuration</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Category Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                            <option value="article">Article</option>
                            <option value="course">Course</option>
                            <option value="podcast">Podcast</option>
                            <option value="ebook">Ebook</option>
                            <option value="guide">Guide</option>
                        </select>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="flex items-center space-x-2 mb-4">
                            <CircleDollarSign className="text-amber-500" size={16} />
                            <label className="flex items-center justify-between cursor-pointer flex-grow">
                                <div><span className="block text-xs font-bold text-slate-700">Premium Content</span><span className="text-[10px] text-slate-400 uppercase tracking-widest">Requires Payment</span></div>
                                <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-slate-300" />
                            </label>
                        </div>
                        {isPremium && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 pt-4 border-t border-slate-200">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pricing (USD)</label>
                                    <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" /></div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center">
                                        <ExternalLink size={10} className="mr-1" />
                                        Payhip Product Link
                                    </label>
                                    <input type="text" value={payhipUrl} onChange={(e) => setPayhipUrl(e.target.value)} placeholder="https://payhip.com/b/XXXX" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none" />
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <label className="block text-[10px] font-bold text-rose-500 uppercase mb-1 flex items-center"><Key size={10} className="mr-1" /> Access Unlock Password</label>
                                    <input type="text" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="Secret key for user entry" className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500/20" />
                                    <p className="text-[8px] text-slate-400 mt-1 italic">Provide this key to customers in your Payhip purchase confirmation.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Cover Visual URL</label><input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none" />{coverImage && <img src={coverImage} className="mt-4 rounded-2xl aspect-video object-cover shadow-sm" />}</div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Search Tags</label><input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="trust, healing, growth..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center"><Youtube className="mr-2 text-red-600" size={14} />Video Vault</h3>
                    <button onClick={handleMagicFetchVideos} disabled={isFetchingVideos} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center group">{isFetchingVideos ? <Loader2 size={12} className="animate-spin mr-1" /> : <Sparkles size={12} className="mr-1 group-hover:animate-pulse" />}Magic Fetch</button>
                </div>
                {relatedVideos.length > 0 ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {relatedVideos.map((video) => (
                            <div key={video.id} className="group relative flex items-center p-2 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all">
                                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white"><img src={video.thumbnail} className="w-full h-full object-cover" alt="" /></div>
                                <div className="ml-3 flex-grow min-w-0"><div className="text-[10px] font-bold text-slate-900 line-clamp-1 truncate">{video.title}</div><div className="text-[8px] text-slate-400 uppercase tracking-widest font-black">{video.channelTitle}</div></div>
                                <button onClick={() => removeRelatedVideo(video.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50"><div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Video size={16} className="text-slate-300" /></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-6 leading-relaxed">Fetch YouTube videos.</p></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
