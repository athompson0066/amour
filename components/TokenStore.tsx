
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, Key, ArrowLeft, Loader2, Sparkles, CheckCircle2, ShoppingBag, AlertCircle, Heart } from 'lucide-react';
import { User } from '../types';
import { getCurrentUser, updateUser } from '../services/authService';

interface TokenStoreProps {
  onBack: () => void;
}

interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonus: string;
  payhipUrl: string;
  unlockCode: string; // For simulation/demo purposes, normally Payhip provides this
  popular?: boolean;
}

const PACKS: TokenPack[] = [
  {
    id: 'pack-starter',
    name: 'Seeker Pack',
    tokens: 50,
    price: 9.99,
    bonus: '+5 Bonus Tokens',
    payhipUrl: 'https://payhip.com/b/example-50',
    unlockCode: 'LOVE-50-START',
    popular: false
  },
  {
    id: 'pack-pro',
    name: 'Intimacy Bundle',
    tokens: 200,
    price: 29.99,
    bonus: '+25 Bonus Tokens',
    payhipUrl: 'https://payhip.com/b/example-200',
    unlockCode: 'HEAL-200-BNDL',
    popular: true
  },
  {
    id: 'pack-master',
    name: 'Soul Alchemist',
    tokens: 500,
    price: 59.99,
    bonus: '+100 Bonus Tokens',
    payhipUrl: 'https://payhip.com/b/example-500',
    unlockCode: 'SOUL-500-ALCH',
    popular: false
  }
];

const TokenStore: React.FC<TokenStoreProps> = ({ onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim() || !user) return;

    setIsRedeeming(true);
    setError(null);
    setSuccess(null);

    await new Promise(r => setTimeout(r, 1000));

    const foundPack = PACKS.find(p => p.unlockCode === redeemCode.trim().toUpperCase());
    
    if (foundPack) {
        const bonus = parseInt(foundPack.bonus.replace(/[^0-9]/g, '')) || 0;
        const totalAward = foundPack.tokens + bonus;
        
        const updatedUser = { ...user, tokens: user.tokens + totalAward };
        await updateUser(updatedUser);
        setUser(updatedUser);
        setSuccess(`Manifested! ${totalAward} Tokens added to your balance.`);
        setRedeemCode('');
    } else {
        setError("Celestial code invalid. Please check your Payhip receipt.");
    }
    setIsRedeeming(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-rose-600 transition-colors font-bold text-sm">
                <ArrowLeft size={18} />
                <span>Return</span>
            </button>
            <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center">
                <Zap className="mr-2 text-amber-500 fill-current" />
                Token Treasury
            </h2>
            <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center shadow-lg">
                <Zap size={12} className="mr-2 text-amber-400" />
                {user?.tokens || 0} Tokens
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Recharge Your Connection</h1>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                Purchase token packs via Payhip to unlock sessions with our experts. One token represents a spark of insight; one session represents a lifetime of growth.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {PACKS.map(pack => (
                <div key={pack.id} className={`group relative bg-white border-2 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col ${pack.popular ? 'border-rose-500 shadow-xl shadow-rose-900/5 scale-105 z-10' : 'border-slate-100 shadow-sm'}`}>
                    {pack.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                            Most Resonant
                        </div>
                    )}
                    
                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform ${pack.popular ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap size={32} className="fill-current" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{pack.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{pack.tokens} Base Tokens</p>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>{pack.bonus} Included</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Lifetime Validity</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Expert Council Access</span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="text-center mb-4">
                            <span className="text-3xl font-black text-slate-900">${pack.price}</span>
                        </div>
                        <a 
                            href={pack.payhipUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${pack.popular ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            <ShoppingBag size={18} className="mr-2" />
                            Buy on Payhip
                        </a>
                    </div>
                </div>
            ))}
        </div>

        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Key size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
                        <Key className="mr-2 text-indigo-500" size={18} />
                        Redeem Access Code
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                        Enter the license key from your purchase email to manifest your tokens.
                    </p>

                    <form onSubmit={handleRedeem} className="space-y-4">
                        <input 
                            type="text"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                            placeholder="e.g. LOVE-200-XXXX"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono text-sm outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-700 flex items-center">
                                    <AlertCircle size={14} className="mr-2" />
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-bold text-emerald-700 flex items-center">
                                    <CheckCircle2 size={14} className="mr-2" />
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            type="submit"
                            disabled={!redeemCode.trim() || isRedeeming}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {isRedeeming ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            Manifest Tokens
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6">
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="mr-1.5 text-emerald-500" />
                    Secure Redemption
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Heart size={14} className="mr-1.5 text-rose-500" />
                    Global Trust
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TokenStore;
