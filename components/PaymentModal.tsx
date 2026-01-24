
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, ShieldCheck, AlertCircle, Loader2, Lock, Sparkles, CreditCard, ExternalLink, Key, ChevronRight } from 'lucide-react';
import { Post, User, Agent } from '../types';
import { loadPayhipSDK } from '../services/payhipService';

interface PaymentModalProps {
  item: Post | Agent;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ item, user, onClose, onSuccess }) => {
  const [step, setStep] = useState<'review' | 'password-entry' | 'success'>('review');
  const [sdkReady, setSdkReady] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const isPost = 'type' in item;
  const itemTitle = isPost ? (item as Post).title : (item as Agent).name;
  const itemPrice = isPost ? ((item as Post).price || 9.99) : ((item as Agent).priceValue || 2.99);
  const itemTypeLabel = isPost ? (item as Post).type : 'Consultation';
  const itemImage = isPost ? (item as Post).coverImage : (item as Agent).avatar;
  const payhipUrl = item.payhipProductUrl;
  const correctPassword = item.unlockPassword;

  // Preload Payhip SDK as soon as modal mounts
  useEffect(() => {
    loadPayhipSDK()
      .then(() => setSdkReady(true))
      .catch(err => console.warn("Payhip SDK failed to load, falling back to direct link mode.", err));
  }, []);

  const handleValidatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPassword.trim()) return;

    setIsValidating(true);
    setPasswordError(null);

    // Artificial delay for "security check" feeling
    await new Promise(r => setTimeout(r, 800));

    if (correctPassword && enteredPassword.trim() === correctPassword.trim()) {
        setStep('success');
        setTimeout(() => {
            onSuccess();
        }, 1500);
    } else {
        setPasswordError("Access code invalid. Please check your purchase email.");
        setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-white">
        {step !== 'success' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {step === 'review' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="bg-rose-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-rose-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure Checkout</h3>
              <p className="text-slate-500 text-sm mt-1">Unlock premium content via Payhip.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-start space-x-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-white shadow-sm bg-slate-200">
                <img src={itemImage} className="w-full h-full object-cover" alt="Cover" />
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{itemTitle}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{itemTypeLabel}</p>
                <div className="flex items-center mt-2">
                  <span className="font-bold text-rose-600 text-lg">${itemPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {payhipUrl ? (
                <a 
                  href={payhipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="payhip-buy-button w-full flex items-center justify-center py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg font-bold text-sm"
                >
                  <ExternalLink className="mr-2" size={18} />
                  Buy Now via Payhip
                </a>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs italic text-center">
                  Payhip link not found. Contact administrator.
                </div>
              )}
              
              <button 
                onClick={() => setStep('password-entry')}
                className="w-full flex items-center justify-center py-3.5 bg-white text-rose-600 hover:bg-rose-50 transition-colors font-bold text-xs border border-rose-100 rounded-2xl"
              >
                <Key className="mr-2" size={14} />
                I already have an access code
              </button>
            </div>
            
            <div className="mt-6 flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center text-[10px] text-slate-400 space-x-1 font-medium uppercase tracking-widest">
                <Lock size={10} />
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        )}

        {step === 'password-entry' && (
          <div className="p-8">
             <button 
                onClick={() => setStep('review')}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center mb-6"
             >
                <ChevronRight size={14} className="rotate-180 mr-1" />
                Back
             </button>

             <div className="text-center mb-8">
                <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Enter Access Code</h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    Please enter the secret password provided in your Payhip purchase confirmation email.
                </p>
             </div>

             <form onSubmit={handleValidatePassword} className="space-y-4">
                <div className="relative">
                    <input 
                        type="text"
                        autoFocus
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        placeholder="e.g. LOVE-2024-XXXX"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                    />
                </div>

                {passwordError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-50 text-rose-700 text-[10px] font-bold text-center rounded-xl border border-rose-100 flex items-center justify-center"
                    >
                        <AlertCircle size={14} className="mr-2" />
                        {passwordError}
                    </motion.div>
                )}

                <button 
                    type="submit"
                    disabled={!enteredPassword.trim() || isValidating}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                    {isValidating ? <Loader2 className="animate-spin mr-2" /> : null}
                    Unlock Content
                </button>
             </form>

             <p className="text-[10px] text-slate-400 text-center mt-6 italic">
                Check your email (including spam) for the unlock key.
             </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">Access Granted</h3>
            <p className="text-slate-500 text-sm mt-3">Your code has been verified. Welcome!</p>
            <div className="mt-8 flex justify-center">
              <Loader2 className="animate-spin text-rose-500" size={24} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
