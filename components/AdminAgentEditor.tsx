
import React, { useState } from 'react';
import { Save, X, UserCheck, Image, DollarSign, BrainCircuit, Activity, Plus, Trash2, Loader2, Sparkles, Code2, Copy, Check, Info, Share2, Zap } from 'lucide-react';
import { Agent } from '../types';
import { saveAgent, addCustomAgent } from '../services/storage';

interface AdminAgentEditorProps {
  onCancel: () => void;
  onSave: () => void;
  initialAgent?: Agent;
}

const AdminAgentEditor: React.FC<AdminAgentEditorProps> = ({ onCancel, onSave, initialAgent }) => {
  const [name, setName] = useState(initialAgent?.name || '');
  const [role, setRole] = useState(initialAgent?.role || '');
  const [avatar, setAvatar] = useState(initialAgent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
  const [description, setDescription] = useState(initialAgent?.description || '');
  const [systemInstruction, setSystemInstruction] = useState(initialAgent?.systemInstruction || '');
  const [embedCode, setEmbedCode] = useState(initialAgent?.embedCode || '');
  const [price, setPrice] = useState(initialAgent?.price || '$2.99/min');
  const [priceValue, setPriceValue] = useState(initialAgent?.priceValue || 2.99);
  const [isOnline, setIsOnline] = useState(initialAgent?.isOnline ?? true);
  const [expertiseStr, setExpertiseStr] = useState(initialAgent?.expertise.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name || !role) return alert("Name and Role are mandatory.");
    
    setIsSaving(true);
    try {
        const expertise = expertiseStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const agentData = {
            name, 
            role, 
            avatar, 
            description, 
            systemInstruction,
            embedCode: embedCode.trim(), 
            price, 
            priceValue, 
            isOnline, 
            expertise
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

  const copySnippet = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <UserCheck className="mr-2 text-rose-500" />
            {initialAgent ? 'Update Profile' : 'Expert Onboarding'}
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Embed Slugs</label>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    <div 
                                        onClick={() => copySnippet(`[agent:${initialAgent.id}]`, 'id')}
                                        className="group flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-rose-500/50 transition-all active:scale-95"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Global ID</span>
                                            <code className="text-[11px] text-rose-300 font-mono">[agent:{initialAgent.id.substring(0,8)}...]</code>
                                        </div>
                                        {copied === 'id' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-600 group-hover:text-white" />}
                                    </div>
                                    {embedCode && (
                                        <div 
                                            onClick={() => copySnippet(`[${embedCode}]`, 'slug')}
                                            className="group flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-rose-500/50 transition-all active:scale-95"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Custom Slug</span>
                                                <code className="text-[11px] text-rose-400 font-mono">[{embedCode}]</code>
                                            </div>
                                            {copied === 'slug' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-600 group-hover:text-white" />}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-6 leading-relaxed italic relative z-10">
                                    Paste either code into any article, blog post, or course to embed this complete AI Expert experience.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Fields */}
                <div className="lg:col-span-8 p-10 space-y-8 bg-white">
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
                                placeholder="e.g. Relationship Architect"
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 mb-2 ml-1">Directory Bio</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A powerful intro that will appear on the expert's card and embedded widgets..."
                            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none h-28 resize-none text-sm leading-relaxed"
                        />
                    </div>

                    <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 shadow-inner">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-xl"><Sparkles className="text-indigo-600" size={20} /></div>
                            <label className="block text-sm font-black text-indigo-900">AI Personality Core</label>
                        </div>
                        <textarea 
                            value={systemInstruction} 
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            placeholder="Example: Act as a direct, results-oriented relationship coach. Use sports analogies. Be encouraging but firm."
                            className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-32 resize-none bg-white text-sm leading-relaxed"
                        />
                    </div>

                    <div className="bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-rose-100 rounded-xl"><Code2 className="text-rose-600" size={20} /></div>
                                <label className="block text-sm font-black text-rose-900">Content Embed Shortcode</label>
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
                            placeholder="e.g. relationship-agent"
                            className="w-full px-5 py-4 border border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white font-mono text-sm text-rose-600"
                        />
                        <p className="text-[10px] text-rose-400 font-bold mt-4 leading-relaxed tracking-wide px-1">
                            * Use this slug to embed this agent into your blog posts. Example: typing <strong className="text-rose-600 font-black">[{embedCode || 'my-agent'}]</strong> anywhere in your article text will replace it with the complete interactive agent widget.
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
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAgentEditor;
