
import React, { useState, useEffect } from 'react';
import { Plus, Image, Type, Quote, Save, Wand2, X, Trash2, Layout, DollarSign, Sparkles, BookOpen, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { Post, ContentBlock, ContentType, Agent } from '../types';
import { savePost, getAgents, getAstroAgents } from '../services/storage';
import { generateBlogOutline, enhanceContent, generateCourseStructure } from '../services/geminiService';

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
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialPost?.blocks || []);
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || `https://picsum.photos/seed/${Date.now()}/800/400`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState(initialPost?.tags.join(', ') || '');
  
  // Expert Selector State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  // Course Generator State
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
      meta: type === 'header' ? { level: 'h2', ...meta } : meta
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleAIOutline = async () => {
    if (!title) {
        alert("Please enter a title first so the AI knows what to write about.");
        return;
    }
    setIsGenerating(true);
    const outline = await generateBlogOutline(title);
    
    const lines = outline.split('\n').filter(l => l.trim().length > 0);
    const newBlocks: ContentBlock[] = lines.map(line => {
       const cleanLine = line.replace(/^[-*#]+ /, '');
       return {
           id: Math.random().toString(36).substr(2, 9),
           type: line.includes('Intro') || line.includes('Conclusion') ? 'text' : 'header',
           content: cleanLine,
           meta: { level: 'h2' }
       };
    });
    
    setBlocks([...blocks, ...newBlocks]);
    setIsGenerating(false);
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
          price: type === 'course' ? price : undefined,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          blocks,
          relatedVideos: initialPost?.relatedVideos
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
      {/* Course Generator Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
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
                    <p className="text-slate-600 text-sm">
                        Describe your course idea, curriculum, and pricing details.
                    </p>
                    {generationError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start"><AlertCircle size={16} className="mr-2 mt-0.5" />{generationError}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                        <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" value={courseTopic} onChange={(e) => setCourseTopic(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Draft Outline</label>
                        <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} />
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

      {/* Agent Selector Modal */}
      {showAgentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-900">Select Expert to Embed</h3>
                      <button onClick={() => setShowAgentModal(false)}><X size={24} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                      {availableAgents.map(agent => (
                          <button 
                            key={agent.id} 
                            onClick={() => handleEmbedAgent(agent)}
                            className="w-full flex items-center p-3 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                          >
                              <img src={agent.avatar} className="w-10 h-10 rounded-full object-cover mr-3" />
                              <div className="text-left">
                                  <div className="font-bold text-sm text-slate-900">{agent.name}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">{agent.role}</div>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <Layout className="mr-2 text-rose-500" />
            {initialPost ? 'Edit Content' : 'Create New Content'}
        </h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-md flex items-center font-medium disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none text-lg font-serif" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
                        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24 resize-none" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
                         <div className="flex space-x-2">
                            <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="flex-grow px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                         </div>
                    </div>
                    <div className="flex gap-4">
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                             <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                                 <option value="article">Article</option>
                                 <option value="course">Course</option>
                                 <option value="podcast">Podcast</option>
                             </select>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4 min-h-[400px]">
            {blocks.map((block) => (
                <div key={block.id} className="group relative bg-white p-4 rounded-lg border border-transparent hover:border-slate-300 transition-all">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                         <button onClick={() => removeBlock(block.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                    
                    {block.type === 'header' && <input className="w-full font-serif font-bold text-slate-900 border-none outline-none focus:ring-0 text-2xl" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} />}
                    {block.type === 'text' && <textarea className="w-full resize-y min-h-[100px] border-none outline-none focus:ring-0 text-slate-700 text-lg" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} />}
                    {block.type === 'image' && <input className="w-full text-sm text-slate-500 border border-slate-200 rounded px-2 py-1" value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} />}
                    {block.type === 'agent' && (
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center">
                            <UserCheck className="text-rose-500 mr-3" />
                            <span className="font-bold text-slate-900">{block.content}</span>
                        </div>
                    )}
                </div>
            ))}

            <div className="flex justify-center space-x-4 py-8 border-t border-slate-200 mt-8 border-dashed">
                <button onClick={() => addBlock('header')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600"><Type size={20} /><span className="text-xs mt-1">Header</span></button>
                <button onClick={() => addBlock('text')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600"><Layout size={20} /><span className="text-xs mt-1">Text</span></button>
                <button onClick={() => setShowAgentModal(true)} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 group">
                    <div className="p-2 bg-slate-100 group-hover:bg-rose-100 rounded-full transition-colors">
                        <UserCheck size={20} />
                    </div>
                    <span className="text-xs mt-1 font-bold">Add Expert</span>
                </button>
                <button onClick={() => addBlock('image')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600"><Image size={20} /><span className="text-xs mt-1">Image</span></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
