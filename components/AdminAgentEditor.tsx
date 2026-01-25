
import React, { useState } from 'react';
// Added missing imports for motion and AnimatePresence to fix errors on lines 284, 286, 299, and 301
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, UserCheck, Image, DollarSign, BrainCircuit, Activity, Plus, Trash2, Loader2, Sparkles, Code2, Copy, Check, Info, Share2, Zap, ExternalLink, CircleDollarSign, Globe, Eye, Brain, Search, Link as LinkIcon, FileText, Database, Stars, Users, Terminal, Key, Monitor, Cpu } from 'lucide-react';
import { Agent, AgentTools, SEOMetadata } from '../types';
import { saveAgent, addCustomAgent } from '../services/storage';
import { generateSEOMetadata } from '../services/geminiService';

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
  const [tokenCost, setTokenCost] = useState<number>(initialAgent?.tokenCost || 5);
  const [payhipUrl, setPayhipUrl] = useState(initialAgent?.payhipProductUrl || '');
  const [unlockPassword, setUnlockPassword] = useState(initialAgent?.unlockPassword || '');
  const [isOnline, setIsOnline] = useState(initialAgent?.isOnline ?? true);
  const [expertiseStr, setExpertiseStr] = useState(initialAgent?.expertise.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // SEO States
  const [seo, setSeo] = useState<SEOMetadata>(initialAgent?.seo || {
      metaTitle: '',
      metaDescription: '',
      focusKeywords: '',
  });
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  const [tools, setTools] = useState<AgentTools>(initialAgent?.tools || { 
    googleSearch: false, 
    vision: false, 
    codeExecution: false,
    webScraping: false, 
    targetWebsites: [],
    googleDriveEnabled: false,
    googleDriveLinks: []
  });
  const [thinkingBudget, setThinkingBudget] = useState<number>(initialAgent?.thinkingBudget || 0);

  // List management helpers
  const [tempWebsite, setTempWebsite] = useState('');
  const [tempDriveLink, setTempDriveLink] = useState('');

  const addWebsite = () => {
    if (tempWebsite && !tools.targetWebsites?.includes(tempWebsite)) {
        setTools(prev => ({ ...prev, targetWebsites: [...(prev.targetWebsites || []), tempWebsite] }));
        setTempWebsite('');
    }
  };

  const removeWebsite = (site: string) => {
    setTools(prev => ({ ...prev, targetWebsites: prev.targetWebsites?.filter(s => s !== site) }));
  };

  const addDriveLink = () => {
    if (tempDriveLink && !tools.googleDriveLinks?.includes(tempDriveLink)) {
        setTools(prev => ({ ...prev, googleDriveLinks: [...(prev.googleDriveLinks || []), tempDriveLink] }));
        setTempDriveLink('');
    }
  };

  const removeDriveLink = (link: string) => {
    setTools(prev => ({ ...prev, googleDriveLinks: prev.googleDriveLinks?.filter(l => l !== link) }));
  };

  const handleMagicSEO = async () => {
    if (!name) return alert("Enter expert name first.");
    setIsGeneratingSEO(true);
    try {
        const data = await generateSEOMetadata(name, description, "AI Expert Profile", expertiseStr);
        if (data) {
            setSeo({
                ...seo,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                focusKeywords: data.focusKeywords
            });
        }
    } catch (e) {} finally {
        setIsGeneratingSEO(false);
    }
  };

  const handleSave = async () => {
    if (!name || !role) return alert("Name and Role are mandatory.");
    setIsSaving(true);
    try {
        const expertise = expertiseStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const agentData = {
            name, role, category, avatar, description, systemInstruction,
            embedCode: embedCode.trim(), price, priceValue, tokenCost, payhipProductUrl: payhipUrl,
            unlockPassword: unlockPassword, isOnline, expertise, tools, thinkingBudget,
            seo: (seo.metaTitle || seo.metaDescription) ? seo : undefined
        };
        if (initialAgent) { await saveAgent(initialAgent.id, agentData); } 
        else {
            const newAgent: Agent = { id: `expert_${Date.now()}`, ...agentData };
            await addCustomAgent(newAgent);
        }
        onSave();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  const toggleTool = (tool: keyof AgentTools) => {
    setTools(prev => ({ ...prev, [tool]: !prev[tool] }));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <UserCheck className="mr-2 text-rose-500" />
            {initialAgent ? 'Update Expert' : 'Expert Onboarding'}
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors text-sm font-bold">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xl flex items-center font-bold disabled:opacity-70 transition-all active:scale-95">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Save Profile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-4 p-10 bg-slate-50/80 border-r border-slate-100 flex flex-col items-center overflow-y-auto max-h-[800px] custom-scrollbar">
                    <div className="relative mb-10">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <button onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)} className="absolute bottom-1 right-1 p-3 bg-rose-600 rounded-full shadow-2xl text-white hover:bg-rose-700 transition-all border-4 border-white"><Plus size={20} /></button>
                    </div>
                    
                    <div className="w-full space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Identity Visual</label>
                            <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none" />
                        </div>

                        {/* Thinking Budget Control */}
                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <Activity className="mr-1.5 text-rose-400" size={12} /> Thinking Budget
                                </label>
                                <span className="text-[10px] font-mono text-rose-400">{thinkingBudget} tokens</span>
                            </div>
                            <input 
                                type="range" min="0" max="32000" step="1000"
                                value={thinkingBudget}
                                onChange={(e) => setThinkingBudget(parseInt(e.target.value))}
                                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[9px] text-slate-500 mt-2 italic leading-relaxed">
                                Higher budget enables deeper reasoning but increases latency. Set to 0 to disable thinking.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Globe className="mr-1.5 text-indigo-500" size={12} /> Search Preview</label>
                                <button onClick={handleMagicSEO} disabled={isGeneratingSEO || !name} className="p-1 hover:bg-slate-50 rounded text-indigo-600 transition-colors">
                                    {isGeneratingSEO ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input 
                                    type="text" value={seo.metaTitle} 
                                    onChange={(e) => setSeo({...seo, metaTitle: e.target.value})} 
                                    placeholder="SEO Name..." 
                                    className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-400" 
                                />
                                <textarea 
                                    value={seo.metaDescription} 
                                    onChange={(e) => setSeo({...seo, metaDescription: e.target.value})} 
                                    placeholder="Search bio..." 
                                    className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-[11px] text-slate-500 outline-none focus:ring-1 focus:ring-indigo-400 h-16 resize-none" 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center space-x-3"><div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} /><span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active Now</span></div>
                             <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div></label>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 p-10 space-y-8 bg-white overflow-y-auto max-h-[800px] custom-scrollbar">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl mb-4 shadow-inner">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Expert Council Assignment</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setCategory('relationship')} className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${category === 'relationship' ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-200'}`}><Users size={18} /><span className="text-sm font-bold">Relationship Expert</span></button>
                            <button onClick={() => setCategory('astro')} className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${category === 'astro' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}><Stars size={18} /><span className="text-sm font-bold">Astro-Council</span></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Jordan Smith" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Expert Role</label><input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Scorpio Specialist" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" /></div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 mb-2 ml-1 flex items-center">
                            <Terminal className="mr-2 text-rose-500" size={16} /> 
                            Core Methodology (System Instructions)
                        </label>
                        <textarea 
                            value={systemInstruction} 
                            onChange={(e) => setSystemInstruction(e.target.value)} 
                            placeholder="You are an AI advisor that specializes in..." 
                            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none h-40 resize-none text-sm font-mono" 
                        />
                    </div>

                    <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Directory Bio</label><div className="relative"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A powerful intro..." className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none h-28 resize-none text-sm" /></div></div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl">
                        <div className="flex items-center space-x-3 mb-6"><div className="p-2 bg-rose-500/20 rounded-xl"><Zap className="text-rose-500" size={20} /></div><label className="block text-sm font-black text-white">Capabilities & Tools</label></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => toggleTool('googleSearch')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.googleSearch ? 'bg-rose-600/10 border-rose-500/50 text-rose-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-rose-900'}`}>
                                <div className="flex items-center space-x-3"><Globe size={18} className={tools.googleSearch ? 'text-rose-400' : 'text-slate-500'} /><div className="text-left"><span className="block text-xs font-bold">Google Search</span><span className="text-[9px] opacity-60">Real-time grounding</span></div></div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.googleSearch ? 'border-rose-400 bg-rose-400' : 'border-slate-600'}`}>{tools.googleSearch && <Check size={10} className="text-white" />}</div>
                            </button>
                            <button onClick={() => toggleTool('webScraping')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.webScraping ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-900'}`}>
                                <div className="flex items-center space-x-3"><Search size={18} className={tools.webScraping ? 'text-emerald-400' : 'text-slate-500'} /><div className="text-left"><span className="block text-xs font-bold">Web Scraper</span><span className="text-[9px] opacity-60">Custom site lookup</span></div></div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.webScraping ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`}>{tools.webScraping && <Check size={10} className="text-white" />}</div>
                            </button>
                            <button onClick={() => toggleTool('vision')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.vision ? 'bg-blue-600/10 border-blue-500/50 text-blue-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-900'}`}>
                                <div className="flex items-center space-x-3"><Monitor size={18} className={tools.vision ? 'text-blue-400' : 'text-slate-500'} /><div className="text-left"><span className="block text-xs font-bold">Vision</span><span className="text-[9px] opacity-60">Analyze images</span></div></div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.vision ? 'border-blue-400 bg-blue-400' : 'border-slate-600'}`}>{tools.vision && <Check size={10} className="text-white" />}</div>
                            </button>
                            <button onClick={() => toggleTool('codeExecution')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${tools.codeExecution ? 'bg-amber-600/10 border-amber-500/50 text-amber-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-900'}`}>
                                <div className="flex items-center space-x-3"><Cpu size={18} className={tools.codeExecution ? 'text-amber-400' : 'text-slate-500'} /><div className="text-left"><span className="block text-xs font-bold">Code Execution</span><span className="text-[9px] opacity-60">Native logic sandbox</span></div></div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tools.codeExecution ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>{tools.codeExecution && <Check size={10} className="text-white" />}</div>
                            </button>
                        </div>

                        {/* Web Scraper Context Links */}
                        <div className={`mt-6 space-y-4 transition-all duration-300 ${tools.webScraping ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Target Websites for Grounding</label>
                            <div className="flex space-x-2">
                                <input type="text" value={tempWebsite} onChange={(e) => setTempWebsite(e.target.value)} placeholder="e.g. example.com" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                                <button onClick={addWebsite} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"><Plus size={18} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tools.targetWebsites?.map(site => (
                                    <span key={site} className="flex items-center space-x-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-300">
                                        <span>{site}</span>
                                        <button onClick={() => removeWebsite(site)} className="text-slate-500 hover:text-rose-500"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Google Drive Links */}
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Database size={18} className="text-rose-500" />
                                    <span className="text-xs font-bold text-white">Google Drive Assets</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={tools.googleDriveEnabled} onChange={(e) => setTools(prev => ({...prev, googleDriveEnabled: e.target.checked}))} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
                                </label>
                            </div>
                            <AnimatePresence>
                                {tools.googleDriveEnabled && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                                        <div className="flex space-x-2">
                                            <input type="text" value={tempDriveLink} onChange={(e) => setTempDriveLink(e.target.value)} placeholder="Public Drive Link..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                                            <button onClick={addDriveLink} className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"><Plus size={18} /></button>
                                        </div>
                                        <div className="space-y-2">
                                            {tools.googleDriveLinks?.map(link => (
                                                <div key={link} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 group">
                                                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{link}</span>
                                                    <button onClick={() => removeDriveLink(link)} className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100 shadow-inner">
                        <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-3"><div className="p-2 bg-rose-100 rounded-xl"><Code2 className="text-rose-600" size={20} /></div><label className="block text-sm font-black text-rose-900">Custom Embed Slug</label></div></div>
                        <input type="text" value={embedCode} onChange={(e) => setEmbedCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. scorpio-expert" className="w-full px-5 py-4 border border-rose-200 rounded-2xl outline-none bg-white font-mono text-sm text-rose-600 focus:ring-2 focus:ring-rose-500/20" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Consultation Rate</label><input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$2.99/min" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10" /></div>
                        <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Token Cost (per msg)</label><input type="number" value={tokenCost} onChange={(e) => setTokenCost(parseInt(e.target.value))} className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10" /></div>
                        <div><label className="block text-sm font-black text-slate-900 mb-2 ml-1">Expertise Domains</label><input type="text" value={expertiseStr} onChange={(e) => setExpertiseStr(e.target.value)} placeholder="Dating, Loss, Trust..." className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10" /></div>
                    </div>

                    <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 mt-8 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6"><div className="p-2 bg-amber-100 rounded-xl"><CircleDollarSign className="text-amber-600" size={20} /></div><label className="block text-sm font-black text-amber-900">Monetization & Access</label></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div><label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Payhip Value ($)</label><input type="number" value={priceValue} onChange={(e) => setPriceValue(parseFloat(e.target.value))} className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl outline-none" step="0.01" /></div>
                            <div><label className="block text-xs font-bold text-amber-600 uppercase mb-2 ml-1">Payhip Product URL</label><input type="text" value={payhipUrl} onChange={(e) => setPayhipUrl(e.target.value)} placeholder="https://payhip.com/b/XXXX" className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl outline-none text-xs" /></div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-amber-200/50">
                            <label className="block text-[10px] font-bold text-amber-600 uppercase mb-2 flex items-center"><Key size={10} className="mr-1" /> Access Unlock Password</label>
                            <input type="text" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="Secret key for user entry" className="w-full px-5 py-3.5 bg-white border border-amber-200 rounded-2xl outline-none text-xs font-mono" />
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
