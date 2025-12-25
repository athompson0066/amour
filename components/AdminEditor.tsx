
import React, { useState } from 'react';
import { Plus, Image, Type, Quote, Save, Wand2, X, Trash2, Layout, DollarSign, Sparkles, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Post, ContentBlock, ContentType } from '../types';
import { savePost } from '../services/storage';
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
  
  // Course Generator State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTopic, setCourseTopic] = useState('');
  const [courseAudience, setCourseAudience] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      meta: type === 'header' ? { level: 'h2' } : {}
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
    
    // Parse the outline into blocks (simple heuristic)
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
            
            // Transform blocks to have IDs
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
            setGenerationError("Failed to generate course. The AI response was incomplete. Please try a simpler topic.");
        }
    } catch (e) {
        console.error(e);
        setGenerationError("An unexpected error occurred.");
    } finally {
        setIsGenerating(false);
    }
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
          // Preserve original date if editing, else use current date
          publishedAt: initialPost?.publishedAt || new Date().toISOString(),
          readTime: type === 'course' ? '4 Week Course' : '5 min read',
          isPremium,
          price: type === 'course' ? price : undefined,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          blocks,
          relatedVideos: initialPost?.relatedVideos // Preserve videos from agents
        };
        
        await savePost(newPost);
        onSave();
    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save post. Check console for details.");
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
                        Describe your course idea, and our AI will generate a complete curriculum, sales page copy, and suggested pricing.
                    </p>
                    
                    {generationError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
                            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                            {generationError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Topic</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            placeholder="e.g. Healing from Heartbreak"
                            value={courseTopic}
                            onChange={(e) => setCourseTopic(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            placeholder="e.g. Women in their 30s"
                            value={courseAudience}
                            onChange={(e) => setCourseAudience(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Draft Outline / Instructions (Optional)</label>
                        <textarea 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none h-24"
                            placeholder="e.g. Start with a module on self-love, then move to communication styles. Make the tone humorous but serious."
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={() => setShowCourseModal(false)} 
                        className="px-4 py-2 text-slate-500 mr-2 hover:text-slate-700"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerateCourse}
                        disabled={isGenerating || !courseTopic}
                        className="px-6 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Wand2 className="animate-spin mr-2" size={18} />
                                Writing Curriculum...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2" size={18} />
                                Generate Course
                            </>
                        )}
                    </button>
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
            className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-md flex items-center font-medium disabled:opacity-70 disabled:cursor-wait"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            {isSaving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-6">
        {/* Meta Data Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter an engaging title..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-lg font-serif"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
                        <textarea 
                            value={subtitle} 
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="A brief summary..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none h-24 resize-none"
                        />
                    </div>
                     <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <button 
                            onClick={() => setShowCourseModal(true)}
                            className="flex items-center space-x-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-sm transition-all transform hover:scale-105"
                        >
                            <Sparkles size={14} />
                            <span>Auto-Generate Course</span>
                        </button>
                        <button 
                            onClick={handleAIOutline}
                            disabled={isGenerating}
                            className="flex items-center space-x-2 text-sm text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-full border border-slate-200 hover:border-rose-200 transition-colors"
                        >
                            <Wand2 size={14} className={isGenerating ? "animate-spin" : ""} />
                            <span>Outline</span>
                        </button>
                     </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
                         <div className="flex space-x-2">
                            <input 
                                type="text" 
                                value={coverImage} 
                                onChange={(e) => setCoverImage(e.target.value)}
                                className="flex-grow px-4 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <button onClick={() => setCoverImage(`https://picsum.photos/seed/${Date.now()}/800/400`)} className="px-3 py-2 bg-slate-100 rounded-lg text-xs hover:bg-slate-200">Random</button>
                         </div>
                         <div className="mt-2 aspect-[2/1] bg-slate-100 rounded-lg overflow-hidden relative">
                             <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/10"></div>
                         </div>
                    </div>

                    <div className="flex gap-4">
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                             <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value as ContentType)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                             >
                                 <option value="article">Article</option>
                                 <option value="course">Course</option>
                                 <option value="podcast">Podcast</option>
                                 <option value="listicle">Listicle</option>
                             </select>
                         </div>
                         <div className="flex-1">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma sep)</label>
                             <input 
                                type="text" 
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                placeholder="Love, Dating..."
                             />
                         </div>
                    </div>

                    <div className="space-y-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="premium" 
                                checked={isPremium} 
                                onChange={(e) => setIsPremium(e.target.checked)}
                                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" 
                            />
                            <label htmlFor="premium" className="text-sm font-medium text-yellow-800 flex items-center">
                                <DollarSign size={14} className="mr-1" />
                                Premium Monetized Content
                            </label>
                        </div>
                        
                        {isPremium && type === 'course' && (
                            <div className="pl-6">
                                <label className="block text-xs font-medium text-yellow-800 mb-1">Course Price ($)</label>
                                <input 
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-24 px-2 py-1 text-sm border border-yellow-200 rounded focus:outline-none focus:border-yellow-400"
                                    placeholder="49.99"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Builder Area */}
        <div className="space-y-4 min-h-[400px]">
            {blocks.map((block, index) => (
                <div key={block.id} className="group relative bg-white p-4 rounded-lg border border-transparent hover:border-slate-300 hover:shadow-sm transition-all">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                         <button onClick={() => removeBlock(block.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                    
                    {block.type === 'header' && (
                        <input 
                            className={`w-full font-serif font-bold text-slate-900 border-none outline-none focus:ring-0 placeholder-slate-300 ${block.meta?.level === 'h2' ? 'text-2xl' : 'text-xl'}`}
                            placeholder="Heading..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                        />
                    )}

                    {block.type === 'text' && (
                         <div className="relative">
                             <textarea 
                                className="w-full resize-y min-h-[100px] border-none outline-none focus:ring-0 text-slate-700 text-lg leading-relaxed placeholder-slate-300"
                                placeholder="Start writing..."
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                             />
                             {block.content.length > 20 && (
                                 <button 
                                    onClick={async () => {
                                        const improved = await enhanceContent(block.content);
                                        updateBlock(block.id, improved);
                                    }}
                                    className="absolute bottom-2 right-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                     ✨ Enhance
                                 </button>
                             )}
                         </div>
                    )}

                    {block.type === 'quote' && (
                        <div className="flex">
                            <div className="w-1 bg-rose-400 mr-4 rounded-full"></div>
                            <textarea 
                                className="w-full resize-none border-none outline-none focus:ring-0 text-xl italic text-slate-600 placeholder-slate-300 bg-transparent"
                                placeholder="Enter quote..."
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                        </div>
                    )}

                    {block.type === 'image' && (
                        <div className="space-y-2">
                            <input 
                                className="w-full text-sm text-slate-500 border border-slate-200 rounded px-2 py-1"
                                placeholder="Image URL..."
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                            {block.content && <img src={block.content} alt="Preview" className="h-48 rounded object-cover" />}
                        </div>
                    )}

                     {block.type === 'cta' && (
                        <div className="p-4 bg-slate-100 rounded text-center border-2 border-dashed border-slate-300">
                             <input 
                                className="w-full text-center bg-transparent font-bold text-slate-900 border-none outline-none focus:ring-0 placeholder-slate-400"
                                placeholder="Call to Action Text..."
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                            />
                        </div>
                    )}
                </div>
            ))}

            {/* Add Block Controls */}
            <div className="flex justify-center space-x-4 py-8 border-t border-slate-200 mt-8 border-dashed">
                <span className="text-sm text-slate-400 uppercase tracking-widest font-semibold self-center mr-4">Add Block:</span>
                <button onClick={() => addBlock('header')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Type size={20} />
                    <span className="text-xs mt-1">Header</span>
                </button>
                <button onClick={() => addBlock('text')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Layout size={20} />
                    <span className="text-xs mt-1">Text</span>
                </button>
                 <button onClick={() => addBlock('quote')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Quote size={20} />
                    <span className="text-xs mt-1">Quote</span>
                </button>
                 <button onClick={() => addBlock('image')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Image size={20} />
                    <span className="text-xs mt-1">Image</span>
                </button>
                <button onClick={() => addBlock('cta')} className="flex flex-col items-center p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <DollarSign size={20} />
                    <span className="text-xs mt-1">CTA</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
