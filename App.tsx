
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ArticleCard from './components/ArticleCard';
import ArticleView from './components/ArticleView';
import AdminEditor from './components/AdminEditor';
import AdminSettings from './components/AdminSettings';
import AdminDashboard from './components/AdminDashboard';
import AdminAgentWorkspace from './components/AdminAgentWorkspace';
import AgentCard from './components/AgentCard';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import PaymentModal from './components/PaymentModal';
import VideoHub from './components/VideoHub';
import HeartMendTracker from './components/apps/HeartMendTracker';
import Hero from './components/Hero';
import { FadeIn, StaggerGrid, StaggerItem } from './components/Animated';
import { Post, ContentType, Agent, User } from './types';
import { getPosts, getAgents, getAstroAgents } from './services/storage';
import { getCurrentUser, updateUser } from './services/authService';
import { X, Loader2, BookOpen, Heart, Wrench, Stars, Inbox } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [pendingPaymentItem, setPendingPaymentItem] = useState<Post | Agent | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [astroAgents, setAstroAgents] = useState<Agent[]>([]);
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    refreshData();
    const initUser = async () => {
        const guest = await getCurrentUser();
        setUser(guest);
    };
    initUser();
  }, []);

  const refreshData = async () => {
    setIsLoadingPosts(true);
    const data = await getPosts();
    setPosts(data);
    setAgents(getAgents());
    setAstroAgents(getAstroAgents());
    setIsLoadingPosts(false);
  };

  const handleToggleAdmin = () => {
    const nextAdminState = !isAdmin;
    setIsAdmin(nextAdminState);
    if (nextAdminState) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const checkAccess = (id: string, isPremium: boolean): boolean => {
      if (!isPremium) return true;
      if (!user) return false;
      return user.purchasedContentIds.includes(id) || user.isSubscriber;
  };

  const handlePostClick = (post: Post) => {
    if (!checkAccess(post.id, post.isPremium)) {
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
              purchasedContentIds: [...user.purchasedContentIds, pendingPaymentItem.id] 
          };
          updateUser(updatedUser);
          setUser(updatedUser);
          setShowPaymentModal(false);
          
          const item = pendingPaymentItem;
          setPendingPaymentItem(null);

          if ('type' in item) { 
              if (item.id === 'app-1') setCurrentView('app-heart-mend');
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

  const filteredPosts = posts.filter(post => {
      const matchesType = filterType === 'all' || post.type === filterType;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
  });

  const toolApps = posts.filter(p => p.type === 'app');

  return (
    <Layout 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isAdmin={isAdmin}
        toggleAdmin={handleToggleAdmin}
        user={user}
        onLoginClick={() => {}} // No longer used
        onLogoutClick={() => {}} // No longer used
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
          <Hero onBrowse={() => document.getElementById('directory-content')?.scrollIntoView({ behavior: 'smooth' })} onConsult={() => setCurrentView('agents')} />
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
                        <StaggerGrid key={filterType} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map(post => (
                                <StaggerItem key={post.id}>
                                    <ArticleCard post={post} onClick={handlePostClick} />
                                </StaggerItem>
                            ))}
                        </StaggerGrid>
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
             {toolApps.length > 0 ? (
                <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {toolApps.map(app => <StaggerItem key={app.id}><ArticleCard post={app} onClick={handlePostClick} /></StaggerItem>)}
                </StaggerGrid>
             ) : (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Wrench className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-500">The toolkit is currently being polished. Check back soon!</p>
                </div>
             )}
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
      {currentView === 'video-hub' && <VideoHub />}
      {currentView === 'chat' && selectedAgent && <ChatInterface agent={selectedAgent} onBack={() => setCurrentView('agents')} />}
      {currentView === 'voice' && selectedAgent && <VoiceInterface agent={selectedAgent} onEndCall={() => setCurrentView('agents')} />}
      {currentView === 'article' && selectedPost && (
        <ArticleView 
            post={selectedPost} 
            user={user} 
            onBack={() => setCurrentView('home')} 
            onUnlock={() => {
                setPendingPaymentItem(selectedPost);
                setShowPaymentModal(true);
            }} 
            onLoginRequest={() => {}} // No-op as auth is removed
        />
      )}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard 
          onCreate={() => { setSelectedPost(null); setCurrentView('admin-create'); }} 
          onEdit={(p) => { setSelectedPost(p); setCurrentView('admin-edit'); }} 
          onView={handlePostClick} 
          onGoToWorkspace={() => setCurrentView('admin-agents')}
          onSettings={() => setCurrentView('admin-settings')}
        />
      )}
      {(currentView === 'admin-create' || currentView === 'admin-edit') && (
        <AdminEditor 
            onCancel={() => setCurrentView('admin-dashboard')} 
            onSave={() => { refreshData(); setCurrentView('admin-dashboard'); }} 
            initialPost={selectedPost || undefined} 
        />
      )}
      {currentView === 'admin-settings' && <AdminSettings onCancel={() => setCurrentView('admin-dashboard')} />}
      {currentView === 'admin-agents' && <AdminAgentWorkspace onBack={() => setCurrentView('admin-dashboard')} onPublished={refreshData} />}
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
    </Layout>
  );
};

export default App;
