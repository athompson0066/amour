
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import AdminEditor from './components/AdminEditor';
import AdminAgentEditor from './components/AdminAgentEditor';
import AdminSettings from './components/AdminSettings';
import AdminDashboard from './components/AdminDashboard';
import AdminAgentWorkspace from './components/AdminAgentWorkspace';
import AdminPriceStrategy from './components/AdminPriceStrategy';
import AdminAudioStudio from './components/AdminAudioStudio';
import AdminLogin from './components/AdminLogin';
import AgentCard from './components/AgentCard';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import PaymentModal from './components/PaymentModal';
import TokenStore from './components/TokenStore';
import VideoHub from './components/VideoHub';
import HeartMendTracker from './components/apps/HeartMendTracker';
import SoulmateSketch from './components/SoulmateSketch';
import Hero from './components/Hero';
import { FadeIn, StaggerGrid, StaggerItem } from './components/Animated';
import { Post, ContentType, Agent, User } from './types';
import { getPosts, getAgentsData, deletePost as storageDeletePost, deleteAgent as storageDeleteAgent } from './services/storage';
import { getCurrentUser, updateUser, isAdminAuthenticated, logoutAdmin } from './services/authService';
import { X, Loader2, BookOpen, Heart, Wrench, Stars, Inbox, Sparkles, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Search as SearchIcon } from 'lucide-react';

const POSTS_PER_PAGE = 9;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [pendingPaymentItem, setPendingPaymentItem] = useState<Post | Agent | null>(null);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [astroAgents, setAstroAgents] = useState<Agent[]>([]);
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isExternalEmbed, setIsExternalEmbed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const refreshData = async () => {
    setIsLoadingPosts(true);
    try {
        const [postData, allAgentData] = await Promise.all([
            getPosts(),
            getAgentsData()
        ]);
        
        setPosts(postData);
        setAgents(allAgentData.filter(a => a.category === 'relationship' || !a.category));
        setAstroAgents(allAgentData.filter(a => a.category === 'astro'));
    } catch (e) {
        console.error("Refresh Data failed:", e);
    } finally {
        setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    refreshData().then(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        const agentId = params.get('agent');
        
        if (postId) {
            getPosts().then(allPosts => {
                const target = allPosts.find(p => p.id === postId);
                if (target) {
                    setSelectedPost(target);
                    setCurrentView('article');
                }
            });
        }
    });

    const initUser = async () => {
        const guest = await getCurrentUser();
        setUser(guest);
        setIsAdminAuth(isAdminAuthenticated());
    };
    initUser();
  }, []);

  const handleToggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setCurrentView('home');
    } else {
      if (isAdminAuth) {
        setIsAdminMode(true);
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuth(true);
    setIsAdminMode(true);
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminAuth(false);
    setIsAdminMode(false);
    setCurrentView('home');
  };

  const checkAccess = (id: string, isPremium: boolean): boolean => {
      if (!isPremium) return true;
      if (!user) return false;
      return user.purchasedContentIds.includes(id) || user.isSubscriber;
  };

  const handlePostClick = (post: Post) => {
    if (post.id === 'app-1' && !checkAccess(post.id, post.isPremium)) {
        setPendingPaymentItem(post);
        setShowPaymentModal(true);
        return;
    }
    if (post.id === 'app-1') {
        setCurrentView('app-heart-mend');
        return;
    }
    setSelectedPost(post);
    setCurrentView('article');
    const url = new URL(window.location.href);
    url.searchParams.set('post', post.id);
    window.history.pushState({}, '', url);
    window.scrollTo(0, 0);
  };

  const handleAgentChat = (agent: Agent) => {
    if (!user || user.tokens < agent.tokenCost) {
        setCurrentView('token-store');
        return;
    }
    setSelectedAgent(agent);
    setCurrentView('chat');
  };
  
  const handleAgentCall = (agent: Agent) => {
    if (!user || user.tokens < agent.tokenCost) {
        setCurrentView('token-store');
        return;
    }
    setSelectedAgent(agent);
    setCurrentView('voice');
  };

  const handlePurchaseSuccess = () => {
      if (user && pendingPaymentItem) {
          const updatedUser = { 
              ...user, 
              purchasedContentIds: Array.from(new Set([...user.purchasedContentIds, pendingPaymentItem.id])) 
          };
          updateUser(updatedUser);
          setUser(updatedUser);
          setShowPaymentModal(false);
          const item = pendingPaymentItem;
          setPendingPaymentItem(null);
          if ('type' in item) { 
              if (item.id === 'app-1') setCurrentView('app-heart-mend');
              else if (item.id === 'soulmate-sketch-id') setCurrentView('soulmate-sketch');
              else {
                  setSelectedPost(item as Post);
                  setCurrentView('article');
              }
          } else {
              setSelectedAgent(item as Agent);
              setCurrentView('chat');
          }
      }
  };

  const handleDeletePost = async (id: string) => {
      setPosts(prev => prev.filter(p => p.id !== id));
      await storageDeletePost(id);
      await refreshData();
  };

  const filteredPosts = posts.filter(post => {
      const matchesType = filterType === 'all' || post.type === filterType;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      document.getElementById('directory-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSketchClick = () => {
      const sketchItem: Post = {
          id: 'soulmate-sketch-id',
          title: 'Soulmate Sketch Generator',
          subtitle: 'A psychic portrait of your destined match.',
          type: 'sketch',
          coverImage: '',
          author: { id: 'aethel', name: 'Aethel', avatar: '', bio: '' },
          publishedAt: '',
          readTime: '',
          isPremium: true,
          price: 29.99,
          tags: [],
          blocks: []
      };
      if (!checkAccess(sketchItem.id, true)) {
          setPendingPaymentItem(sketchItem);
          setShowPaymentModal(true);
          return;
      }
      setCurrentView('soulmate-sketch');
  };

  return (
    <Layout 
        currentView={currentView} 
        onChangeView={(view) => {
            if (view === 'home') {
                const url = new URL(window.location.href);
                url.searchParams.delete('post');
                url.searchParams.delete('agent');
                window.history.pushState({}, '', url);
            }
            setCurrentView(view);
        }} 
        isAdmin={isAdminMode}
        isAdminAuthenticated={isAdminAuth}
        toggleAdmin={handleToggleAdmin}
        onAdminLogout={handleAdminLogout}
        user={user}
        onLoginClick={() => {}} 
        onLogoutClick={() => {}}
    >
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[100px] animate-blob"></div>
      </div>

      {showPaymentModal && pendingPaymentItem && (
          <PaymentModal 
              item={pendingPaymentItem} 
              user={user} 
              onClose={() => setShowPaymentModal(false)} 
              onSuccess={handlePurchaseSuccess} 
          />
      )}

      {currentView === 'home' && (
        <>
          <Hero 
            onBrowse={() => document.getElementById('directory-content')?.scrollIntoView({ behavior: 'smooth' })} 
            onConsult={() => setCurrentView('agents')} 
            onSketch={handleSketchClick}
          />
          <div id="directory-content" className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12 gap-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white/50 backdrop-blur rounded-2xl border border-white/50 shadow-sm">
                        {(['all', 'article', 'course', 'podcast', 'website', 'app', 'newsletter'] as const).map((t) => (
                            <button 
                                key={t} 
                                onClick={() => { setFilterType(t); setCurrentPage(1); }} 
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                    filterType === t 
                                    ? 'bg-slate-900 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-white'
                                }`}
                            >
                                {t === 'all' ? 'all' : `${t}s`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group flex-grow md:w-80">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search directory..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/50 backdrop-blur rounded-2xl border border-white/50 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {isLoadingPosts ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-rose-500 mb-4" size={40} />
                </div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        {paginatedPosts.length > 0 ? (
                            <StaggerGrid className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col space-y-8"}>
                                {paginatedPosts.map(post => (
                                    <StaggerItem key={post.id}>
                                        <ArticleCard post={post} onClick={handlePostClick} viewMode={viewMode} />
                                    </StaggerItem>
                                ))}
                            </StaggerGrid>
                        ) : (
                            <div className="py-20 text-center">
                                <SearchIcon className="mx-auto text-slate-200 mb-4" size={48} />
                                <h3 className="text-xl font-serif font-bold text-slate-900">No content matches your search</h3>
                                <p className="text-slate-500 mt-2">Try adjusting your filters or keywords.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="mt-20 flex justify-center items-center space-x-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${
                                        currentPage === page 
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' 
                                        : 'bg-white border border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600 shadow-sm'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all bg-white shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
          </div>
        </>
      )}

      {currentView === 'token-store' && <TokenStore onBack={() => setCurrentView('home')} />}
      {currentView === 'toolkit' && (
         <div className="max-w-7xl mx-auto px-4 py-20">
             <FadeIn className="text-center mb-16"><h1 className="text-5xl font-serif font-bold">Relationship Toolkit</h1></FadeIn>
             <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StaggerItem>
                    <div onClick={handleSketchClick} className="group relative bg-white border border-rose-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden h-full flex flex-col">
                        <div className="relative z-10 flex-grow">
                            <Stars className="text-rose-500 mb-4" size={32} />
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Soulmate Sketch</h3>
                            <p className="text-slate-500 text-sm mb-6">Manifest a hand-drawn psychic portrait of your fated match.</p>
                        </div>
                    </div>
                </StaggerItem>
                {posts.filter(p => p.type === 'app').map(app => <StaggerItem key={app.id}><ArticleCard post={app} onClick={handlePostClick} /></StaggerItem>)}
             </StaggerGrid>
         </div>
      )}

      {currentView === 'astrology' && (
         <div className="max-w-7xl mx-auto px-4 py-20">
            <FadeIn className="text-center mb-16"><Stars className="mx-auto text-rose-500 mb-4" size={48} /><h1 className="text-5xl font-serif font-bold mb-4">The Astro-Council</h1></FadeIn>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {astroAgents.map(agent => <StaggerItem key={agent.id}><AgentCard agent={agent} onChat={handleAgentChat} onCall={handleAgentCall} /></StaggerItem>)}
            </StaggerGrid>
         </div>
      )}

      {currentView === 'agents' && (
         <div className="max-w-7xl mx-auto px-4 py-20">
            <FadeIn className="text-center mb-16"><h1 className="text-5xl font-serif font-bold">Relationship Experts</h1></FadeIn>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map(agent => <StaggerItem key={agent.id}><AgentCard agent={agent} onChat={handleAgentChat} onCall={handleAgentCall} /></StaggerItem>)}
            </StaggerGrid>
         </div>
      )}

      {currentView === 'app-heart-mend' && <HeartMendTracker user={user} onBack={() => setCurrentView('toolkit')} />}
      {currentView === 'soulmate-sketch' && <SoulmateSketch isUnlocked={true} onUnlock={() => {}} onBack={() => setCurrentView('toolkit')} />}
      {currentView === 'video-hub' && <VideoHub />}
      {currentView === 'chat' && selectedAgent && <ChatInterface agent={selectedAgent} onBack={() => { refreshData(); setCurrentView('agents'); }} />}
      {currentView === 'voice' && selectedAgent && <VoiceInterface agent={selectedAgent} onEndCall={() => setCurrentView('agents')} />}
      {currentView === 'article' && selectedPost && (
        <ArticleView post={selectedPost} user={user} onBack={() => { const url = new URL(window.location.href); url.searchParams.delete('post'); window.history.pushState({}, '', url); setCurrentView('home'); }} onUnlock={() => { setPendingPaymentItem(selectedPost); setShowPaymentModal(true); }} onLoginRequest={() => {}} />
      )}
      {currentView === 'admin-login' && <AdminLogin onSuccess={handleAdminAuthSuccess} onCancel={() => setCurrentView('home')} />}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard 
          posts={posts} agents={[...agents, ...astroAgents]} isLoading={isLoadingPosts} onRefresh={refreshData}
          onCreate={() => { setSelectedPost(null); setCurrentView('admin-create'); }} 
          onCreateAgent={() => { setSelectedAgent(null); setCurrentView('admin-agent-edit'); }}
          onEdit={(p) => { setSelectedPost(p); setCurrentView('admin-edit'); }} 
          onEditAgent={(a) => { setSelectedAgent(a); setCurrentView('admin-agent-edit'); }}
          onView={handlePostClick} onDelete={handleDeletePost} onDeleteAgent={async (id) => { await storageDeleteAgent(id); refreshData(); }}
          onGoToWorkspace={() => setCurrentView('admin-agents')} onGoToPricing={() => setCurrentView('admin-pricing')}
          onGoToAudioStudio={() => setCurrentView('admin-audio-studio')} onSettings={() => setCurrentView('admin-settings')}
        />
      )}
      {(currentView === 'admin-create' || currentView === 'admin-edit') && <AdminEditor onCancel={() => setCurrentView('admin-dashboard')} onSave={async () => { await refreshData(); setCurrentView('admin-dashboard'); }} initialPost={selectedPost || undefined} />}
      {currentView === 'admin-agent-edit' && <AdminAgentEditor onCancel={() => setCurrentView('admin-dashboard')} onSave={async () => { await refreshData(); setCurrentView('admin-dashboard'); }} initialAgent={selectedAgent || undefined} />}
      {currentView === 'admin-settings' && <AdminSettings onCancel={() => setCurrentView('admin-dashboard')} />}
      {currentView === 'admin-agents' && <AdminAgentWorkspace onBack={() => setCurrentView('admin-dashboard')} onPublished={async () => { await refreshData(); }} />}
      {currentView === 'admin-pricing' && <AdminPriceStrategy onBack={() => setCurrentView('admin-dashboard')} onRefresh={refreshData} />}
      {currentView === 'admin-audio-studio' && <AdminAudioStudio onBack={() => setCurrentView('admin-dashboard')} onPublished={async () => { await refreshData(); }} />}
    </Layout>
  );
};

export default App;
