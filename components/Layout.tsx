
import React, { useState } from 'react';
import { Heart, LayoutDashboard, Menu, X, BookOpen, Settings, ShieldCheck, LogOut } from 'lucide-react';
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

      <footer className="mt-20 border-t border-rose-100/50 pt-16 pb-8 text-center text-slate-400">
        <p className="text-sm">&copy; 2024 Amour Directory. Made with <Heart size={10} className="inline text-rose-300 fill-current" /> by AI</p>
      </footer>
    </div>
  );
};

export default Layout;
