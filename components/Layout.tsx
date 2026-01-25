
import React, { useState } from 'react';
import { Heart, LayoutDashboard, Menu, X, BookOpen, Settings, ShieldCheck, LogOut, Mail, Instagram, Twitter, Youtube, Send, Sparkles, Zap, Facebook, Linkedin } from 'lucide-react';
// Added missing imports for motion and AnimatePresence
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  toggleAdmin: () => void;
  onAdminLogout: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  isAdmin, 
  isAdminAuthenticated,
  toggleAdmin,
  onAdminLogout,
  user
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 relative selection:bg-rose-200 selection:text-rose-900">
      
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="glass shadow-lg shadow-rose-900/5 rounded-full px-6 py-3 max-w-6xl w-full flex justify-between items-center transition-all duration-300">
            <div className="flex items-center cursor-pointer group" onClick={() => onChangeView('home')}>
              <div className="bg-rose-50 p-2 rounded-full group-hover:bg-rose-100 transition-colors">
                <Heart className="h-5 w-5 text-rose-500 fill-current" />
              </div>
              <span className="ml-3 text-xl font-serif font-bold text-slate-900 tracking-tight">
                Amour<span className="text-rose-500">.</span>
              </span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'home', label: 'Directory' },
                { id: 'toolkit', label: 'Toolkit' },
                { id: 'astrology', label: 'Astro-Council' },
                { id: 'agents', label: 'Experts' },
                { id: 'video-hub', label: 'Videos' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onChangeView(item.id)} 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentView === item.id 
                      ? 'bg-rose-100 text-rose-700 shadow-inner' 
                      : 'text-slate-600 hover:text-rose-600 hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {/* Token Balance Badge */}
              <button 
                onClick={() => onChangeView('token-store')}
                className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all shadow-md group"
              >
                <Zap size={14} className="text-amber-400 fill-current group-hover:animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">{user?.tokens || 0} Tokens</span>
                <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center ml-1">
                    <span className="text-[10px]">+</span>
                </div>
              </button>

              <div className="flex items-center bg-slate-100/50 rounded-full px-1 py-1 border border-slate-200/50">
                  <button 
                    onClick={toggleAdmin}
                    title={isAdmin ? "Exit Admin Mode" : "Admin Portal"}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
                      isAdmin 
                        ? 'bg-slate-900 text-white shadow-xl ring-2 ring-rose-500' 
                        : isAdminAuthenticated
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                  >
                    {isAdmin ? <LayoutDashboard size={18} /> : <ShieldCheck size={18} />}
                    {(isAdmin || isAdminAuthenticated) && <span className="text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'Dashboard' : 'Admin'}</span>}
                  </button>
              </div>
            </div>

            <div className="lg:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
        </div>

        {mobileMenuOpen && (
           <div className="absolute top-16 left-4 right-4 glass bg-white/95 rounded-2xl shadow-xl border border-white/50 overflow-hidden lg:hidden">
             <div className="px-4 pt-4 pb-6 space-y-2">
               {['home', 'toolkit', 'astrology', 'agents', 'video-hub'].map(view => (
                   <button key={view} onClick={() => {onChangeView(view); setMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-slate-600 font-medium hover:text-rose-600 rounded-xl transition-colors capitalize">
                       {view.replace('-', ' ')}
                   </button>
               ))}
                <button onClick={() => {onChangeView('token-store'); setMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-amber-600 font-black rounded-xl transition-colors uppercase tracking-widest flex items-center">
                   <Zap size={16} className="mr-2 fill-current" />
                   {user?.tokens || 0} Tokens Available
               </button>
             </div>
           </div>
        )}
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="mt-20 bg-slate-950 text-slate-300 relative overflow-hidden">
        {/* Abstract shapes for background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-rose-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-8">
              <div className="flex items-center cursor-pointer" onClick={() => onChangeView('home')}>
                <div className="bg-rose-600 p-2.5 rounded-2xl shadow-lg shadow-rose-900/20">
                  <Heart className="h-6 w-6 text-white fill-current" />
                </div>
                <span className="ml-4 text-3xl font-serif font-bold text-white tracking-tight">
                  Amour<span className="text-rose-500">.</span>
                </span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                The premier digital sanctuary for intentional human connection. Curating deep wisdom and expert AI guidance to help you navigate the landscape of love.
              </p>
              <div className="flex items-center space-x-5">
                <button className="p-3 bg-slate-900 rounded-xl hover:bg-rose-600 transition-all group shadow-xl">
                  <Instagram size={20} className="text-slate-400 group-hover:text-white" />
                </button>
                <button className="p-3 bg-slate-900 rounded-xl hover:bg-rose-600 transition-all group shadow-xl">
                  <Twitter size={20} className="text-slate-400 group-hover:text-white" />
                </button>
                <button className="p-3 bg-slate-900 rounded-xl hover:bg-rose-600 transition-all group shadow-xl">
                  <Linkedin size={20} className="text-slate-400 group-hover:text-white" />
                </button>
                <button className="p-3 bg-slate-900 rounded-xl hover:bg-rose-600 transition-all group shadow-xl">
                  <Youtube size={20} className="text-slate-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white">Discovery</h4>
              <ul className="space-y-4 text-base">
                <li><button onClick={() => onChangeView('home')} className="text-slate-400 hover:text-rose-400 transition-all">Content Directory</button></li>
                <li><button onClick={() => onChangeView('toolkit')} className="text-slate-400 hover:text-rose-400 transition-all">Healing Toolkit</button></li>
                <li><button onClick={() => onChangeView('video-hub')} className="text-slate-400 hover:text-rose-400 transition-all">Video Library</button></li>
              </ul>
            </div>

            {/* Expert Council Links */}
            <div className="lg:col-span-2 space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white">Guidance</h4>
              <ul className="space-y-4 text-base">
                <li><button onClick={() => onChangeView('astrology')} className="text-slate-400 hover:text-rose-400 transition-all">Astro Council</button></li>
                <li><button onClick={() => onChangeView('agents')} className="text-slate-400 hover:text-rose-400 transition-all">Expert Consults</button></li>
                <li><button onClick={() => onChangeView('token-store')} className="text-slate-400 hover:text-amber-400 transition-all flex items-center"><Zap size={14} className="mr-2 fill-current text-amber-500" /> Buy Tokens</button></li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-4 space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white">The Love Note</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join 50,000+ readers who receive our weekly curation of connection science and soul-level insights.
              </p>
              <form onSubmit={handleSubscribe} className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" 
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  required
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg"
                >
                  <Send size={18} />
                </button>
              </form>
              <AnimatePresence>
                {subscribed && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-rose-400 font-bold"
                  >
                    Welcome to the inner circle. Check your inbox.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-20 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-medium">
              &copy; {new Date().getFullYear()} Amour Directory. All rights reserved.
            </p>
            <div className="flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <button className="hover:text-rose-500 transition-colors">Privacy Paradigm</button>
              <button className="hover:text-rose-500 transition-colors">Terms of Union</button>
              <button className="hover:text-rose-500 transition-colors">Safety Center</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
