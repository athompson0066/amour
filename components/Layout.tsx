
import React, { useState } from 'react';
import { Heart, LayoutDashboard, Menu, X, BookOpen, Settings, ShieldCheck, LogOut, Mail, Instagram, Twitter, Youtube, Send, Sparkles } from 'lucide-react';
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
        <div className="glass shadow-lg shadow-rose-900/5 rounded-full px-6 py-3 max-w-5xl w-full flex justify-between items-center transition-all duration-300">
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

              <button 
                onClick={() => onChangeView('library')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentView === 'library' 
                    ? 'bg-rose-100 text-rose-700 shadow-inner' 
                    : 'text-slate-600 hover:text-rose-600 hover:bg-white/50'
                }`}
              >
                My Library
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-3">
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
                    {isAdmin ? <LayoutDashboard size={18} /> : isAdminAuthenticated ? <ShieldCheck size={18} /> : <ShieldCheck size={18} />}
                    {(isAdmin || isAdminAuthenticated) && <span className="text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'Dashboard' : 'Admin'}</span>}
                  </button>
                  {isAdminAuthenticated && (
                      <button 
                        onClick={onAdminLogout}
                        title="Logout Admin"
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <LogOut size={16} />
                      </button>
                  )}
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
               {['home', 'toolkit', 'astrology', 'agents', 'video-hub', 'library'].map(view => (
                   <button key={view} onClick={() => {onChangeView(view); setMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-slate-600 font-medium hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors capitalize">
                       {view.replace('-', ' ')}
                   </button>
               ))}
               <div className="border-t border-slate-100 pt-2 space-y-1">
                  <button onClick={() => { toggleAdmin(); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-3 font-bold hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between ${isAdmin ? 'text-rose-600' : 'text-slate-600'}`}>
                     <span>{isAdmin ? 'Exit Dashboard' : isAdminAuthenticated ? 'Admin Dashboard' : 'Admin Access'}</span>
                     <ShieldCheck size={18} className={isAdminAuthenticated ? 'text-emerald-500' : 'text-slate-300'} />
                  </button>
                  {isAdminAuthenticated && (
                      <button onClick={() => { onAdminLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center justify-between">
                         <span>Logout Admin</span>
                         <LogOut size={18} />
                      </button>
                  )}
               </div>
             </div>
           </div>
        )}
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="mt-20 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Branding Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center cursor-pointer" onClick={() => onChangeView('home')}>
                <div className="bg-rose-500 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-white fill-current" />
                </div>
                <span className="ml-3 text-2xl font-serif font-bold text-white tracking-tight">
                  Amour<span className="text-rose-500">.</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                The world's premier digital sanctuary for intentional connection. Curating high-fidelity wisdom and expert AI guidance to help you master the art of relationships.
              </p>
              <div className="flex space-x-4 pt-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><Twitter size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><Youtube size={18} /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Content</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => onChangeView('home')} className="hover:text-rose-400 transition-colors">Directory</button></li>
                <li><button onClick={() => onChangeView('video-hub')} className="hover:text-rose-400 transition-colors">Masterclass Vault</button></li>
                <li><button onClick={() => onChangeView('home')} className="hover:text-rose-400 transition-colors">Premium Courses</button></li>
                <li><button onClick={() => onChangeView('home')} className="hover:text-rose-400 transition-colors">Listen & Learn</button></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Tools</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => onChangeView('toolkit')} className="hover:text-rose-400 transition-colors">Healing Tracker</button></li>
                <li><button onClick={() => onChangeView('astrology')} className="hover:text-rose-400 transition-colors">Astro-Council</button></li>
                <li><button onClick={() => onChangeView('agents')} className="hover:text-rose-400 transition-colors">Expert Network</button></li>
                <li><button onClick={() => onChangeView('home')} className="hover:text-rose-400 transition-colors">Soulmate Sketch</button></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-4 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Stay Inspired</h4>
              <p className="text-slate-400 text-sm">Join 15,000+ others receiving our weekly dispatch on love and consciousness.</p>
              
              <form onSubmit={handleSubscribe} className="relative">
                <div className={`absolute inset-0 bg-rose-500/20 blur-xl rounded-full transition-opacity duration-1000 ${subscribed ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className="relative flex items-center bg-slate-800 rounded-full p-1 border border-slate-700 focus-within:border-rose-500/50 transition-all">
                  <Mail className="ml-4 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="flex-grow bg-transparent border-none outline-none px-4 py-2.5 text-sm text-white placeholder-slate-500"
                    disabled={subscribed}
                  />
                  <button 
                    type="submit"
                    disabled={subscribed}
                    className={`px-6 py-2.5 rounded-full font-bold text-xs transition-all flex items-center space-x-2 ${subscribed ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
                  >
                    {subscribed ? (
                      <>
                        <Sparkles size={14} />
                        <span>Subscribed!</span>
                      </>
                    ) : (
                      <>
                        <span>Join</span>
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Sparkles size={12} className="text-rose-500" />
              <span>&copy; 2024 Amour Directory. All rights reserved.</span>
            </div>
            <div className="flex space-x-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
