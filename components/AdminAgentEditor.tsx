
import React, { useState } from 'react';
import { Save, X, UserCheck, Image, DollarSign, BrainCircuit, Activity, Plus, Trash2, Loader2, Sparkles, Code2, Copy, Check, Info, Share2, Zap, ExternalLink, CircleDollarSign, Globe, Eye, Brain, Search, Link as LinkIcon, FileText, Database, Stars, Users, Terminal } from 'lucide-react';
import { Agent, AgentTools } from '../types';
import { saveAgent, addCustomAgent } from '../services/storage';

interface AdminAgentEditorProps {
  onCancel: () => void;
  onSave: () => void;
  initialAgent?: Agent;
}

const AdminAgentEditor: React.FC<AdminAgentEditorProps> = ({ onCancel, onSave, initialAgent }) => {
  const [name, setName] = useState(initialAgent?.name || '');
  const [role, setRole] = useState(initialAgent?.role || '');
  const [category, setCategory] = useState<'relationship' | 'astro'>(initialAgent?.category || 'relationship');
  const [avatar, setAvatar] = useState(initialAgent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
  const [description, setDescription] = useState(initialAgent?.description || '');
  const [systemInstruction, setSystemInstruction] = useState(initialAgent?.systemInstruction || '');
  const [embedCode, setEmbedCode] = useState(initialAgent?.embedCode || '');
  const [price, setPrice] = useState(initialAgent?.price || '$2.99/min');
  const [priceValue, setPriceValue] = useState(initialAgent?.priceValue || 2.99);
  const [payhipUrl, setPayhipUrl] = useState(initialAgent?.payhipProductUrl || '');
  const [isOnline, setIsOnline] = useState(initialAgent?.isOnline ?? true);
  const [expertiseStr, setExpertiseStr] = useState(initialAgent?.expertise.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Tools & Capabilities State
  const [tools, setTools] = useState<AgentTools>(initialAgent?.tools || { 
    googleSearch: false, 
    vision: false, 
    webScraping: false, 
    targetWebsites: [],
    googleDriveEnabled: false,
    googleDriveLinks: []
  });
  const [thinkingBudget, setThinkingBudget] = useState<number>(initialAgent?.thinkingBudget || 0);
  const [newWebsite, setNewWebsite] = useState('');
  const [newDriveLink, setNewDriveLink] = useState('');

  const handleSave = async () => {
    if (!name || !role) return alert("Name and Role are mandatory.");
    
    setIsSaving(true);
    try {
        const expertise = expertiseStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const agentData = {
            name, 
            role, 
            category,
            avatar, 
            description, 
            systemInstruction,
            embedCode: embedCode.trim(), 
            price, 
            priceValue, 
            payhipProductUrl: payhipUrl,
            isOnline, 
            expertise,
            tools,
            thinkingBudget
        };

        if (initialAgent) {
            await saveAgent(initialAgent.id, agentData);
        } else {
            const newAgent: Agent = {
                id: `expert_${Date.now()}`,
                ...agentData
            };
            await addCustomAgent(newAgent);
        }
        onSave();
    } catch (e) {
        console.error(e);
        alert("Failed to save expert.");
    } finally {
        setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
  };

  const toggleTool = (tool: keyof AgentTools) => {
    setTools(prev => ({ ...prev, [tool]: !prev[tool] }));
  };

  const addWebsite = () => {
    if (!newWebsite.trim()) return;
    const cleanUrl = newWebsite.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!tools.targetWebsites?.includes(cleanUrl)) {
        setTools(prev => ({
            ...prev,
            targetWebsites: [...(prev.targetWebsites || []), cleanUrl]
        }));
    }
    setNewWebsite('');
  };

  const removeWebsite = (site: string) => {
    setTools(prev => ({
        ...prev,
        targetWebsites: prev.targetWebsites?.filter(s => s !== site) || []
    }));
  };

  const addDriveLink = () => {
    if (!newDriveLink.trim()) return;
    if (!tools.googleDriveLinks?.includes(newDriveLink.trim())) {
        setTools(prev => ({
            ...prev,
            googleDriveLinks: [...(prev.googleDriveLinks || []), newDriveLink.trim()]
        }));
    }
    setNewDriveLink('');
  };

  const removeDriveLink = (link: string) => {
    setTools(prev => ({
        ...prev,
        googleDriveLinks: prev.googleDriveLinks?.filter(l => l !== link) || []
    }));
  };

  const getExternalEmbedCode = () => {
      const baseUrl = window.location.origin;
      const id = embedCode || initialAgent?.id;
      return `<iframe src="${baseUrl}/?embed=${id}" width="100%" height="700px" frameborder="0" allow="microphone; camera"></iframe>`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <UserCheck className="mr-2 text-rose-500" />
            {initialAgent ? 'Update Expert' : 'Expert Onboarding'}
        </h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors text-sm font-bold">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xl shadow-rose-900/10 flex items-center font-bold disabled:opacity-70 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Save Profile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Panel: Persona */}
                <div className="lg:col-span-4 p-10 bg-slate-50/80 border-r border-slate-100 flex flex-col items-center">
                    <div className="relative mb-10">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <button 
                            onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
                            className="absolute bottom-1 right-1 p-3 bg-rose-600 rounded-full shadow-2xl text-white hover:bg-rose-700 transition-all border-4 border-white"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    
                    <div className="w-full space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Identity Visual</label>
                            <input 
                                type="text" 
                                value={avatar} 
                                onChange={(e) => setAvatar(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active Now</span>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                             </label>
                        </div>

                        {initialAgent && (
                            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap className="text-rose-500" size={60} />
                                </div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center space-x-2">
                                        <Share2 className="text-rose-500" size={16} />
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Integrations</label>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    <div 
                                        onClick={() => copyToClipboard(`[${embedCode || initialAgent.id}]`, 'slug')}
                                        className="group flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-rose-500/50 transition-all active:scale-95"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Directory Shortcode</span>
                                            <code className="text-[11px] text-rose-400 font-mono">[{embedCode || 'id'}]</code>
                                        </div>
                                        {copied === 'slug' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-600 group-hover:text-white" />}
                                    </div>
                                    
                                    <div 
                                        onClick={() => copyToClipboard(getExternalEmbedCode(), 'html')}
                                        className="group flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all active:scale-95"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-500 font-bold mb-1 uppercase">External HTML Embed</span>
                                            <code className="text-[11px] text-indigo-300 font-mono">&lt;iframe...&gt;</code>
                                        </div>
                                        {copied === 'html' ? <Check size={16} className="text-emerald-400" /> : <Terminal size={16} className="text-slate-600 group-hover:text-white" />}
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-6 leading-relaxed italic relative z-10">
                                    The Shortcode works in directory articles. The HTML snippet works on any other website.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Fields */}
                <div className="lg:col-span-8 p-10 space-y-8 bg-white overflow-y-auto max-h-[800px] custom-scrollbar">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Expert Council Assignment</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setCategory('relationship')}
                                className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${category === 'relationship' ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Users size={18} />
                                <span className="text-sm font-bold">Relationship Expert</span>
                            </button>
                            <button 
                                onClick={() => setCategory('astro')}
                                className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${category === 'astro' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <Stars size={18} />
                                <span className="text-sm font-bold">Astro-Council</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Full Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Dr. Jordan Smith"
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Expert Role</label>
                            <input 
                                type="text" 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Scorpio Specialist"
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Directory Bio</label>
                        <div className="relative">
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A powerful intro that will appear on the expert's card..."
                                className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none h-28 resize-none text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Capabilities Section */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-rose-500/20 rounded-xl"><Zap className="text-rose-500" size={20} /></div>
                            <label className="block text-sm font-black text-white">Capabilities & Advanced Tools</label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => toggleTool('googleSearch')}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.googleSearch ? 'bg-rose-600/10 border-rose-500/50 text-rose-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Globe size={18} className={tools.googleSearch ? 'text-rose-400' : 'text-slate-500'} />
                                    <div className="text-left">
                                        <span className="block text-xs font-bold">Google Grounding</span>
                                        <span className="text-[9px] opacity-60">Real-time web knowledge</span>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.googleSearch ? 'border-rose-400 bg-rose-400' : 'border-slate-600'}`}>
                                    {tools.googleSearch && <Check size={10} className="text-white" />}
                                </div>
                            </button>

                            <button 
                                onClick={() => toggleTool('webScraping')}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.webScraping ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Search size={18} className={tools.webScraping ? 'text-emerald-400' : 'text-slate-500'} />
                                    <div className="text-left">
                                        <span className="block text-xs font-bold">Web Scraper</span>
                                        <span className="text-[9px] opacity-60">Crawl target websites</span>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.webScraping ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`}>
                                    {tools.webScraping && <Check size={10} className="text-white" />}
                                </div>
                            </button>

                            <button 
                                onClick={() => toggleTool('googleDriveEnabled')}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.googleDriveEnabled ? 'bg-amber-600/10 border-amber-500/50 text-amber-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Database size={18} className={tools.googleDriveEnabled ? 'text-amber-400' : 'text-slate-500'} />
                                    <div className="text-left">
                                        <span className="block text-xs font-bold">Drive Knowledge</span>
                                        <span className="text-[9px] opacity-60">Reference PDFs/Docs</span>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.googleDriveEnabled ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>
                                    {tools.googleDriveEnabled && <Check size={10} className="text-white" />}
                                </div>
                            </button>

                            <button 
                                onClick={() => toggleTool('vision')}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.vision ? 'bg-blue-600/10 border-blue-500/50 text-blue-100' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Eye size={18} className={tools.vision ? 'text-blue-400' : 'text-slate-500'} />
                                    <div className="text-left">
                                        <span className="block text-xs font-bold">Image Vision</span>
                                        <span className="text-[9px] opacity-60">Analyze user uploads</span>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.vision ? 'border-blue-400 bg-blue-400' : 'border-slate-600'}`}>
                                    {tools.vision && <Check size={10} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-xl"><Sparkles className="text-indigo-600" size={20} /></div>
                            <label className="block text-sm font-black text-indigo-900">AI Personality Core</label>
                        </div>
                        <textarea 
                            value={systemInstruction} 
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            placeholder="Custom behavior instructions for this expert..."
                            className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-32 resize-none bg-white text-sm"
                        />
                    </div>

                    <div className="bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-rose-100 rounded-xl"><Code2 className="text-rose-600" size={20} /></div>
                                <label className="block text-sm font-black text-rose-900">Custom Embed Slug</label>
                            </div>
                            <div className="flex items-center text-[10px] text-rose-400 font-bold uppercase tracking-widest">
                                <Info size={14} className="mr-2" />
                                URL Friendly
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={embedCode} 
                            onChange={(e) => setEmbedCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="e.g. scorpio-expert"
                            className="w-full px-5 py-4 border border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white font-mono text-sm text-rose-600"
                        />
                        <p className="text-[10px] text-rose-400 font-bold mt-4 leading-relaxed tracking-wide px-1">
                            * Use this slug to embed this expert into articles. Example: typing <strong className="text-rose-600 font-black">[{embedCode || 'expert-slug'}]</strong> in any post replaces it with an interactive widget.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Consultation Rate</label>
                            <input 
                                type="text" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="$2.99/min"
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Expertise Domains</label>
                            <input 
                                type="text" 
                                value={expertiseStr} 
                                onChange={(e) => setExpertiseStr(e.target.value)}
                                placeholder="Dating, Loss, Trust..."
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 mt-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-amber-100 rounded-xl"><CircleDollarSign className="text-amber-600" size={20} /></div>
                            <label className="block text-sm font-black text-amber-900">Monetization</label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Payhip Value ($)</label>
                                <input 
                                    type="number" 
                                    value={priceValue} 
                                    onChange={(e) => setPriceValue(parseFloat(e.target.value))}
                                    className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl outline-none"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Payhip Product URL</label>
                                <input 
                                    type="text" 
                                    value={payhipUrl} 
                                    onChange={(e) => setPayhipUrl(e.target.value)} 
                                    placeholder="https://payhip.com/b/XXXX"
                                    className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl outline-none text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAgentEditor;
