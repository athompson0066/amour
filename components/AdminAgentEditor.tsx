
import React, { useState } from 'react';
import { Save, X, UserCheck, Image, DollarSign, BrainCircuit, Activity, Plus, Trash2, Loader2, Sparkles, Code2, Copy, Check, Info, Share2 } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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

  const copySnippet = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <UserCheck className="mr-2 text-rose-500" />
            {initialAgent ? 'Edit Expert Profile' : 'Onboard New Expert'}
        </h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-md flex items-center font-medium disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Save Profile
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Visual Identity */}
                <div className="p-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center">
                    <div className="relative mb-8">
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <button 
                            onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
                            className="absolute bottom-1 right-1 p-2.5 bg-rose-600 rounded-full shadow-lg text-white hover:bg-rose-700 transition-colors border-4 border-white"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    
                    <div className="w-full space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Avatar URL</label>
                            <input 
                                type="text" 
                                value={avatar} 
                                onChange={(e) => setAvatar(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                             <div className="flex items-center space-x-2">
                                <Activity size={14} className={isOnline ? 'text-green-500' : 'text-slate-400'} />
                                <span className="text-xs font-bold text-slate-700 uppercase">Expert Status</span>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                             </label>
                        </div>

                        {initialAgent && (
                            <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Share2 className="text-rose-500" size={14} />
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Embed Snippet</label>
                                    </div>
                                    {copied && <span className="text-[9px] text-emerald-400 font-bold animate-pulse">COPIED</span>}
                                </div>
                                
                                <div className="space-y-3">
                                    <div 
                                        onClick={() => copySnippet(`[agent:${initialAgent.id}]`)}
                                        className="group flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 cursor-pointer hover:border-rose-500/30 transition-all"
                                    >
                                        <code className="text-[11px] text-rose-300 font-mono">[agent:{initialAgent.id.substring(0,8)}...]</code>
                                        <Copy size={14} className="text-slate-500 group-hover:text-white" />
                                    </div>
                                    {embedCode && (
                                        <div 
                                            onClick={() => copySnippet(`[${embedCode}]`)}
                                            className="group flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 cursor-pointer hover:border-rose-500/30 transition-all"
                                        >
                                            <code className="text-[11px] text-rose-400 font-mono">[{embedCode}]</code>
                                            <Copy size={14} className="text-slate-500 group-hover:text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-500 mt-4 leading-relaxed">
                                    Paste either code (including brackets) into any content block to embed this expert.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="md:col-span-2 p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Expert Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Dr. Jordan Smith"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Expert Role</label>
                            <input 
                                type="text" 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Relationship Coach"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Directory Biography</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief professional intro for the expert card..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none h-20 resize-none text-sm"
                        />
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                        <div className="flex items-center space-x-2 mb-3">
                            <Sparkles className="text-indigo-600" size={18} />
                            <label className="block text-sm font-bold text-indigo-900">AI Personality & Instructions</label>
                        </div>
                        <textarea 
                            value={systemInstruction} 
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            placeholder="Example: Act as a direct relationship coach. Use gentle metaphors."
                            className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none bg-white text-sm"
                        />
                    </div>

                    <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Code2 className="text-rose-500" size={18} />
                                <label className="block text-sm font-bold text-rose-900">Custom Embed Shortcode</label>
                            </div>
                            <div className="flex items-center text-[10px] text-rose-400 italic">
                                <Info size={12} className="mr-1" />
                                No spaces allowed
                            </div>
                        </div>
                        <input 
                            type="text" 
                            value={embedCode} 
                            onChange={(e) => setEmbedCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="e.g. relationship-agent"
                            className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white font-mono text-sm"
                        />
                        <p className="text-[10px] text-rose-400 font-medium mt-3 leading-tight">
                            * Use <strong>[{embedCode || 'relationship-agent'}]</strong> in your posts to embed this expert.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Session Rate</label>
                            <input 
                                type="text" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="$2.99/min"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Expertise Tags</label>
                            <input 
                                type="text" 
                                value={expertiseStr} 
                                onChange={(e) => setExpertiseStr(e.target.value)}
                                placeholder="Dating, Loss, Trust..."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
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
