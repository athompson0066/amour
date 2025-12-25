
import React, { useState, useEffect } from 'react';
import { Post, ContentType } from '../types';
import { getPosts, deletePost } from '../services/storage';
import { isSupabaseConfigured } from '../config';
import { Edit, Trash2, Plus, Eye, Search, LayoutDashboard, FileText, BookOpen, Mic, List, MoreVertical, Loader2, Wifi, WifiOff, Sparkles, BrainCircuit, Mail, Map, Cpu, Book, Settings } from 'lucide-react';
import { FadeIn } from './Animated';

interface AdminDashboardProps {
  onEdit: (post: Post) => void;
  onCreate: () => void;
  onView: (post: Post) => void;
  onGoToWorkspace?: () => void;
  onSettings?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onEdit, onCreate, onView, onGoToWorkspace, onSettings }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await getPosts();
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPosts();
    setIsConnected(isSupabaseConfigured());
  }, []);

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setDeleteConfirm(null);
    loadPosts(); // Refresh list
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || post.type === filterType;
    return matchesSearch && matchesType;
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
                    Content Dashboard
                </h1>
                <div className="flex items-center mt-2 space-x-3">
                    <p className="text-slate-500 text-sm">Manage your courses, articles, and products.</p>
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
              <button 
                  onClick={onSettings}
                  className="bg-slate-100 text-slate-700 px-5 py-3 rounded-full font-medium hover:bg-slate-200 transition-all flex items-center border border-slate-200"
                  title="Configure API Keys and Integration"
              >
                  <Settings size={18} className="mr-2" />
                  API Settings
              </button>
              <button 
                  onClick={onGoToWorkspace}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-full font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center group"
              >
                  <BrainCircuit size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                  Agent Workspace
              </button>
              <button 
                  onClick={onCreate}
                  className="bg-rose-600 text-white px-5 py-3 rounded-full font-medium hover:bg-rose-700 shadow-lg hover:shadow-xl transition-all flex items-center"
              >
                  <Plus size={18} className="mr-2" />
                  Manual Entry
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full md:w-96">
                 <Search size={18} className="text-slate-400 mr-2" />
                 <input 
                    type="text" 
                    placeholder="Search posts..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>
             
             <div className="flex space-x-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                {(['all', 'article', 'course', 'podcast', 'listicle', 'newsletter', 'guide', 'ebook'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setFilterType(t as ContentType | 'all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                            filterType === t 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {t}
                    </button>
                ))}
             </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
                <div className="p-20 text-center">
                    <Loader2 className="animate-spin text-rose-500 mx-auto w-10 h-10 mb-4" />
                    <p className="text-slate-500">Loading content library...</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="p-20 text-center">
                    <FileText className="text-slate-200 mx-auto w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No posts found</h3>
                    <p className="text-slate-500 mb-6">Create your first piece of content to get started.</p>
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
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Premium {post.price ? `($${post.price})` : ''}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Free
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(post.publishedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {deleteConfirm === post.id ? (
                                        <div className="flex items-center justify-end space-x-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                            <span className="text-xs text-red-600 font-bold mr-2">Sure?</span>
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                                            >
                                                Yes, Delete
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-md hover:bg-slate-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onView(post)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="View"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => onEdit(post)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(post.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
