
import React, { useState, useEffect } from 'react';
import { Post, ContentType, Agent } from '../types';
import { isSupabaseConfigured } from '../config';
import { Edit, Trash2, Plus, Eye, Search, LayoutDashboard, FileText, BookOpen, Mic, List, MoreVertical, Loader2, Wifi, WifiOff, Sparkles, BrainCircuit, Mail, Map, Cpu, Book, Settings, CircleDollarSign, RefreshCw, UserCheck, Users, Stars, Code, Check, Mic2 } from 'lucide-react';
import { FadeIn } from './Animated';

interface AdminDashboardProps {
  posts: Post[];
  agents: Agent[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onEdit: (post: Post) => void;
  onEditAgent: (agent: Agent) => void;
  onDelete: (id: string) => Promise<void>;
  onDeleteAgent: (id: string) => Promise<void>;
  onCreate: () => void;
  onCreateAgent: () => void;
  onView: (post: Post) => void;
  onGoToWorkspace?: () => void;
  onGoToPricing?: () => void;
  onGoToAudioStudio?: () => void;
  onSettings?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  posts, 
  agents,
  isLoading, 
  onRefresh, 
  onEdit, 
  onEditAgent,
  onDelete, 
  onDeleteAgent,
  onCreate, 
  onCreateAgent,
  onView, 
  onGoToWorkspace, 
  onGoToPricing, 
  onGoToAudioStudio,
  onSettings 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'experts'>('content');
  const [expertSubTab, setExpertSubTab] = useState<'relationship' | 'astro'>('relationship');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(isSupabaseConfigured());
    onRefresh(); 
  }, []);

  const handleDelete = async (id: string) => {
    if (activeTab === 'content') {
        await onDelete(id);
    } else {
        await onDeleteAgent(id);
    }
    setDeleteConfirm(null);
  };

  const copyShortcode = (agent: Agent) => {
      const code = `[${agent.embedCode || agent.id}]`;
      navigator.clipboard.writeText(code);
      setCopiedId(agent.id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || post.type === filterType;
    return matchesSearch && matchesType;
  });

  const allRelevantAgents = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = expertSubTab === 'relationship' 
          ? (agent.category === 'relationship' || !agent.category)
          : agent.category === 'astro';
      return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'course': return <BookOpen size={16} className="text-indigo-500" />;
      case 'podcast': return <Mic size={16} className="text-purple-500" />;
      case 'listicle': return <List size={16} className="text-orange-500" />;
      case 'newsletter': return <Mail size={16} className="text-blue-500" />;
      case 'guide': return <Map size={16} className="text-emerald-500" />;
      case 'tutorial': return <Cpu size={16} className="text-slate-500" />;
      case 'ebook': return <Book size={16} className="text-rose-400" />;
      case 'app': return <Sparkles size={16} className="text-yellow-500" />;
      default: return <FileText size={16} className="text-rose-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center">
                    <LayoutDashboard className="mr-3 text-rose-500" />
                    Admin Portal
                </h1>
                <div className="flex items-center mt-2 space-x-3">
                    <p className="text-slate-500 text-sm">Orchestrate your directory's digital universe.</p>
                    {isConnected ? (
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                            <Wifi size={12} className="mr-1" /> Cloud Connected
                        </span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                            <WifiOff size={12} className="mr-1" /> Local Storage Only
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={onSettings} className="bg-slate-100 text-slate-700 px-5 py-3 rounded-full font-medium hover:bg-slate-200 transition-all flex items-center border border-slate-200"><Settings size={18} className="mr-2" /> API Settings</button>
              <button onClick={onGoToAudioStudio} className="bg-rose-50 text-rose-700 px-5 py-3 rounded-full font-medium hover:bg-rose-100 transition-all flex items-center border border-rose-100"><Mic2 size={18} className="mr-2" /> Voice Studio</button>
              <button onClick={onGoToPricing} className="bg-amber-100 text-amber-700 px-5 py-3 rounded-full font-medium hover:bg-amber-200 transition-all flex items-center border border-amber-200"><CircleDollarSign size={18} className="mr-2" /> Price Strategy</button>
              <button onClick={onGoToWorkspace} className="bg-indigo-600 text-white px-5 py-3 rounded-full font-medium hover:bg-indigo-700 shadow-lg transition-all flex items-center group"><BrainCircuit size={18} className="mr-2 group-hover:rotate-12 transition-transform" /> Agent Workspace</button>
              <button 
                  onClick={activeTab === 'content' ? onCreate : onCreateAgent}
                  className="bg-rose-600 text-white px-5 py-3 rounded-full font-medium hover:bg-rose-700 shadow-lg transition-all flex items-center"
              >
                  <Plus size={18} className="mr-2" />
                  New {activeTab === 'content' ? 'Content' : 'Expert'}
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText size={16} className="mr-2" />
                    Content Library
                </button>
                <button 
                    onClick={() => setActiveTab('experts')}
                    className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'experts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <UserCheck size={16} className="mr-2" />
                    AI Experts
                </button>
            </div>

            {activeTab === 'experts' && (
                <div className="flex space-x-1 bg-indigo-50 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setExpertSubTab('relationship')}
                        className={`flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${expertSubTab === 'relationship' ? 'bg-rose-600 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                    >
                        <Users size={12} className="mr-2" />
                        Relationship
                    </button>
                    <button 
                        onClick={() => setExpertSubTab('astro')}
                        className={`flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${expertSubTab === 'astro' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                    >
                        <Stars size={12} className="mr-2" />
                        Astro-Council
                    </button>
                </div>
            )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full md:w-96">
                 <Search size={18} className="text-slate-400 mr-2" />
                 <input 
                    type="text" 
                    placeholder={`Search ${activeTab === 'content' ? 'posts' : 'experts'}...`} 
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>
             
             <div className="flex items-center space-x-2">
                 <button onClick={() => onRefresh()} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Sync Data">
                     <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                 </button>
                 {activeTab === 'content' && (
                     <div className="flex space-x-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                        {(['all', 'article', 'course', 'podcast', 'listicle', 'newsletter', 'guide', 'ebook'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t as ContentType | 'all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${filterType === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                     </div>
                 )}
             </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
                <div className="p-20 text-center">
                    <Loader2 className="animate-spin text-rose-500 mx-auto w-10 h-10 mb-4" />
                    <p className="text-slate-500">Retrieving intelligence...</p>
                </div>
            ) : activeTab === 'content' ? (
                filteredPosts.length === 0 ? (
                    <div className="p-20 text-center">
                        <FileText className="text-slate-200 mx-auto w-16 h-16 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No content found</h3>
                        <p className="text-slate-500 mb-6">Manifest your first piece of content to begin.</p>
                        <button onClick={onCreate} className="text-rose-600 font-medium hover:underline">Create New Post</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-16 bg-slate-200 rounded-md overflow-hidden mr-4 flex-shrink-0">
                                                <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 line-clamp-1">{post.title}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{post.subtitle || 'No subtitle'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm capitalize text-slate-600">
                                            <span className="mr-2">{getTypeIcon(post.type)}</span>
                                            {post.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.isPremium ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Premium {post.price ? `($${post.price})` : ''}</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Free</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        {deleteConfirm === post.id ? (
                                            <div className="flex items-center justify-end space-x-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                                <span className="text-xs text-red-600 font-bold mr-2">Sure?</span>
                                                <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded-md">Yes</button>
                                                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">No</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onView(post)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="View"><Eye size={18} /></button>
                                                <button onClick={() => onEdit(post)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => setDeleteConfirm(post.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )
            ) : (
                /* Experts Tab */
                allRelevantAgents.length === 0 ? (
                    <div className="p-20 text-center">
                        <UserCheck className="text-slate-200 mx-auto w-16 h-16 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No experts found</h3>
                        <p className="text-slate-500 mb-6">Onboard your first AI {expertSubTab} expert.</p>
                        <button onClick={onCreateAgent} className="text-rose-600 font-medium hover:underline">Add New Expert</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Expert Name</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4">Rate</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allRelevantAgents.map(agent => (
                                <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2 border-white shadow-sm">
                                                <img src={agent.avatar} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="font-medium text-slate-900">{agent.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{agent.role}</td>
                                    <td className="px-6 py-4 text-sm text-amber-700 font-bold">{agent.price}</td>
                                    <td className="px-6 py-4 text-right">
                                        {deleteConfirm === agent.id ? (
                                            <div className="flex items-center justify-end space-x-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                                <span className="text-xs text-red-600 font-bold mr-2">Sure?</span>
                                                <button onClick={() => handleDelete(agent.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded-md">Yes</button>
                                                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">No</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => copyShortcode(agent)} 
                                                    className={`p-2 rounded-full transition-all ${copiedId === agent.id ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`} 
                                                    title="Copy Shortcode"
                                                >
                                                    {copiedId === agent.id ? <Check size={18} /> : <Code size={18} />}
                                                </button>
                                                <button onClick={() => onEditAgent(agent)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => setDeleteConfirm(agent.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
