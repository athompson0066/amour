
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
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
import VideoHub from './components/VideoHub';
import HeartMendTracker from './components/apps/HeartMendTracker';
import SoulmateSketch from './components/SoulmateSketch';
import Hero from './components/Hero';
import { FadeIn, StaggerGrid, StaggerItem } from './components/Animated';
import { Post, ContentType, Agent, User } from './types';
import { getPosts, getAgents, getAstroAgents, deletePost as storageDeletePost, deleteAgent as storageDeleteAgent } from './services/storage';
import { getCurrentUser, updateUser, isAdminAuthenticated, logoutAdmin } from './services/authService';
import { X, Loader2, BookOpen, Heart, Wrench, Stars, Inbox, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  const [user, setUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    refreshData().then(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        const agentId = params.get('agent');
        const embedId = params.get('embed');
        
        if (embedId) {
            const allAgents = [...getAgents(), ...getAstroAgents()];
            const target = allAgents.find(a => a.id === embedId || a.embedCode === embedId);
            if (target) {
                setSelectedAgent(target);
                setIsExternalEmbed(true);
                setCurrentView('chat');
                return;
            }
        }

        if (postId) {
            getPosts().then(allPosts => {
                const target = allPosts.find(p => p.id === postId);
                if (target) {
                    setSelectedPost(target);
                    setCurrentView('article');
                }
            });
        }

        if (agentId) {
            const allAgents = [...getAgents(), ...getAstroAgents()];
            const target = allAgents.find(a => a.id === agentId);
            if (target) {
                if (!user?.purchasedContentIds.includes(target.id) && !user?.isSubscriber) {
                    setPendingPaymentItem(target);
                    setShowPaymentModal(true);
                } else {
                    setSelectedAgent(target);
                    setCurrentView('chat');
                }
            }
        }
    });

    const initUser = async () => {
        const guest = await getCurrentUser();
        setUser(guest);
        setIsAdminAuth(isAdminAuthenticated());
    };
    initUser();
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  const refreshData = async () => {
    setIsLoadingPosts(true);
    const postData = await getPosts();
    const agentData = getAgents();
    const astroData = getAstroAgents();
    setPosts(postData);
    setAgents(agentData);
    setAstroAgents(astroData);
    setIsLoadingPosts(false);
  };

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
    if (!checkAccess(agent.id, true)) {
        setPendingPaymentItem(agent);
        setShowPaymentModal(true);
        return;
    }
    setSelectedAgent(agent);
    setCurrentView('chat');
  };
  
  const handleAgentCall = (agent: Agent) => {
    if (!checkAccess(agent.id, true)) {
        setPendingPaymentItem(agent);
        setShowPaymentModal(true);
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
      await storageDeletePost(id);
      await refreshData();
  };

  const handleDeleteAgent = async (id: string) => {
      await storageDeleteAgent(id);
      await refreshData();
  };

  const filteredPosts = posts.filter(post => {
      const matchesType = filterType === 'all' || post.type === filterType;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
  });

  // Calculate Paginated Content
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
      setCurrentPage(page);
      document.getElementById('directory-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toolApps = posts.filter(p => p.type === 'app');

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

  if (isExternalEmbed && selectedAgent && currentView === 'chat') {
      return <div className="h-screen w-full bg-transparent"><ChatInterface agent={selectedAgent} onBack={() => {}} /></div>;
  }

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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div className="flex flex-wrap gap-2">
                    {(['all', 'article', 'course', 'podcast', 'app', 'guide', 'ebook', 'newsletter'] as const).map((t) => (
                        <button 
                            key={t} 
                            onClick={() => setFilterType(t)} 
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 ${
                                filterType === t 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                                : 'bg-white border border-slate-100 text-slate-600 hover:border-rose-200 hover:text-rose-600'
                            }`}
                        >
                            {t === 'all' ? 'All' : `${t}s`}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-sm font-medium">
                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full font-bold">
                        {filteredPosts.length}
                    </span>
                    <span>Resources Found</span>
                </div>
            </div>

            {isLoadingPosts ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-rose-500 mb-4" size={40} />
                    <p className="text-slate-400 font-medium animate-pulse">Gathering content...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {filteredPosts.length > 0 ? (
                        <div key={filterType + currentPage}>
                            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedPosts.map(post => (
                                    <StaggerItem key={post.id}>
                                        <ArticleCard post={post} onClick={handlePostClick} />
                                    </StaggerItem>
                                ))}
                            </StaggerGrid>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex flex-col items-center">
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        <div className="flex items-center px-4 space-x-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                                            currentPage === page
                                                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                                                            : 'bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button 
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-24 text-center bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200"
                        >
                            <Inbox className="mx-auto text-slate-200 mb-4" size={64} />
                            <h3 className="text-xl font-bold text-slate-800">No content found in this category</h3>
                            <p className="text-slate-500 mt-2">Try selecting a different tab or checking back later.</p>
                            <button 
                                onClick={() => setFilterType('all')}
                                className="mt-6 text-rose-600 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
          </div>
        </>
      )}

      {currentView === 'toolkit' && (
         <div className="max-w-7xl mx-auto px-4 py-20">
             <FadeIn className="text-center mb-16"><h1 className="text-5xl font-serif font-bold">Relationship Toolkit</h1></FadeIn>
             <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StaggerItem>
                    <div 
                        onClick={handleSketchClick}
                        className="group relative bg-white border border-rose-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0"></div>
                        <div className="relative z-10 flex-grow">
                            <Stars className="text-rose-500 mb-4" size={32} />
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Soulmate Sketch</h3>
                            <p className="text-slate-500 text-sm mb-6">Manifest a hand-drawn psychic portrait of your fated match based on astrological alignment.</p>
                        </div>
                        <div className="mt-auto pt-6 flex justify-between items-center border-t border-slate-50">
                             <span className="text-rose-600 font-bold">$29.99 One-time</span>
                             <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200">
                                 <Sparkles size={18} />
                             </div>
                        </div>
                    </div>
                </StaggerItem>
                {toolApps.map(app => <StaggerItem key={app.id}><ArticleCard post={app} onClick={handlePostClick} /></StaggerItem>)}
             </StaggerGrid>
         </div>
      )}

      {currentView === 'astrology' && (
         <div className="max-w-7xl mx-auto px-4 py-20">
            <FadeIn className="text-center mb-16">
              <Stars className="mx-auto text-rose-500 mb-4" size={48} />
              <h1 className="text-5xl font-serif font-bold mb-4">The Astro-Council</h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">Specialized AI Experts for every zodiac sign. find your cosmic match instantly.</p>
            </FadeIn>
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
      {currentView === 'chat' && selectedAgent && <ChatInterface agent={selectedAgent} onBack={() => setCurrentView('agents')} />}
      {currentView === 'voice' && selectedAgent && <VoiceInterface agent={selectedAgent} onEndCall={() => setCurrentView('agents')} />}
      {currentView === 'article' && selectedPost && (
        <ArticleView 
            post={selectedPost} 
            user={user} 
            onBack={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('post');
                window.history.pushState({}, '', url);
                setCurrentView('home');
            }} 
            onUnlock={() => {
                setPendingPaymentItem(selectedPost);
                setShowPaymentModal(true);
            }} 
            onLoginRequest={() => {}} 
        />
      )}
      {currentView === 'admin-login' && <AdminLogin onSuccess={handleAdminAuthSuccess} onCancel={() => setCurrentView('home')} />}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard 
          posts={posts}
          agents={[...agents, ...astroAgents]}
          isLoading={isLoadingPosts}
          onRefresh={refreshData}
          onCreate={() => { setSelectedPost(null); setCurrentView('admin-create'); }} 
          onCreateAgent={() => { setSelectedAgent(null); setCurrentView('admin-agent-edit'); }}
          onEdit={(p) => { setSelectedPost(p); setCurrentView('admin-edit'); }} 
          onEditAgent={(a) => { setSelectedAgent(a); setCurrentView('admin-agent-edit'); }}
          onView={handlePostClick} 
          onDelete={handleDeletePost}
          onDeleteAgent={handleDeleteAgent}
          onGoToWorkspace={() => setCurrentView('admin-agents')}
          onGoToPricing={() => setCurrentView('admin-pricing')}
          onGoToAudioStudio={() => setCurrentView('admin-audio-studio')}
          onSettings={() => setCurrentView('admin-settings')}
        />
      )}
      {(currentView === 'admin-create' || currentView === 'admin-edit') && (
        <AdminEditor 
            onCancel={() => setCurrentView('admin-dashboard')} 
            onSave={async () => { await refreshData(); setCurrentView('admin-dashboard'); }} 
            initialPost={selectedPost || undefined} 
        />
      )}
      {currentView === 'admin-agent-edit' && (
        <AdminAgentEditor 
            onCancel={() => setCurrentView('admin-dashboard')} 
            onSave={async () => { await refreshData(); setCurrentView('admin-dashboard'); }} 
            initialAgent={selectedAgent || undefined} 
        />
      )}
      {currentView === 'admin-settings' && <AdminSettings onCancel={() => setCurrentView('admin-dashboard')} />}
      {currentView === 'admin-agents' && <AdminAgentWorkspace onBack={() => setCurrentView('admin-dashboard')} onPublished={async () => { await refreshData(); }} />}
      {currentView === 'admin-pricing' && <AdminPriceStrategy onBack={() => setCurrentView('admin-dashboard')} onRefresh={refreshData} />}
      {currentView === 'admin-audio-studio' && <AdminAudioStudio onBack={() => setCurrentView('admin-dashboard')} onPublished={async () => { await refreshData(); }} />}
      {currentView === 'library' && (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <FadeIn className="text-center mb-16">
            <h1 className="text-5xl font-serif font-bold">My Library</h1>
            <p className="text-slate-500 mt-4">Your purchased items across this session.</p>
          </FadeIn>
          {user && user.purchasedContentIds.length > 0 ? (
             <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...posts, ...agents, ...astroAgents].filter(p => user.purchasedContentIds.includes(p.id)).map(item => (
                    <StaggerItem key={item.id}>
                        {'type' in item ? (
                          <ArticleCard post={item as Post} onClick={handlePostClick} />
                        ) : (
                          <AgentCard agent={item as Agent} onChat={handleAgentChat} onCall={handleAgentCall} />
                        )}
                    </StaggerItem>
                ))}
             </StaggerGrid>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
                <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400">You haven't purchased any premium content yet.</p>
                <button onClick={() => setCurrentView('home')} className="mt-4 text-rose-600 font-bold hover:underline">Explore the Directory</button>
            </div>
          )}
        </div>
      )}
      <Analytics />
    </Layout>
  );
};

export default App;
