
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle, Heart } from 'lucide-react';
import { loginAsAdmin } from '../services/authService';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await loginAsAdmin(username, password);
      if (success) {
        onSuccess();
      } else {
        setError("The coordinates for your access are incorrect.");
      }
    } catch (err) {
      setError("Connection to the central vault failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-rose-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-xl mb-6 text-rose-500">
                <Shield size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Admin Portal</h2>
            <p className="text-slate-500 font-medium">Restricted Access for Amour Directors</p>
        </div>

        <div className="glass bg-white/80 p-8 rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100"
              >
                <AlertCircle size={18} />
                <p className="text-xs font-bold">{error}</p>
              </motion.div>
            )}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full group bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Decrypt & Enter</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <button 
            onClick={onCancel}
            className="w-full mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors py-2"
          >
            Cancel Access
          </button>
        </div>

        <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <Heart size={10} className="text-rose-300" />
                <span>Vault Security Enabled</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
