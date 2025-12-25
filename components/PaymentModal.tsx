
import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, ShieldCheck, AlertCircle, Loader2, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { Post, User, Agent } from '../types';
import { loadPayPalScript } from '../services/paypalService';

interface PaymentModalProps {
  item: Post | Agent;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ item, user, onClose, onSuccess }) => {
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  const isPost = 'type' in item;
  const itemTitle = isPost ? (item as Post).title : (item as Agent).name;
  const itemPrice = isPost ? ((item as Post).price || 9.99) : ((item as Agent).priceValue || 2.99);
  const itemTypeLabel = isPost ? (item as Post).type : 'Consultation';
  const itemImage = isPost ? (item as Post).coverImage : (item as Agent).avatar;

  const initializePayPal = async () => {
    setLoading(true);
    setError(null);
    buttonsRendered.current = false;
    
    if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
    }

    try {
      const paypal = await loadPayPalScript();
      
      if (!paypalContainerRef.current || buttonsRendered.current) return;

      await paypal.Buttons({
        style: {
          layout: 'vertical',
          color:  'blue',
          shape:  'rect',
          label:  'pay'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
              purchase_units: [{
                  description: itemTitle,
                  amount: { 
                    currency_code: 'USD',
                    value: itemPrice.toFixed(2) 
                  }
              }]
          });
        },
        onApprove: async (data: any, actions: any) => {
           const details = await actions.order.capture();
           setStep('success');
           setTimeout(() => onSuccess(), 1500);
        },
        onError: (err: any) => {
          console.error('PayPal Button Error:', err);
          setError("PayPal could not initialize. This is often due to browser security settings in preview environments. You can use 'Simulate' below to test the app features.");
        },
        onCancel: () => {
          setError("Payment was cancelled.");
        }
      }).render(paypalContainerRef.current);
      
      buttonsRendered.current = true;
      setLoading(false);

    } catch (err: any) {
      console.error("PayPal Initialization Error:", err);
      setError(err.message || "Connection to PayPal failed.");
      setLoading(false);
    }
  };

  const handleSimulateSuccess = () => {
      setLoading(true);
      setTimeout(() => {
          setStep('success');
          setTimeout(() => onSuccess(), 1500);
      }, 800);
  };

  useEffect(() => {
    initializePayPal();

    return () => {
        if (paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = '';
        }
    };
  }, [itemPrice, itemTitle]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-white">
        {step === 'review' && (
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 hover:bg-slate-100 rounded-full"
            >
                <X size={20} />
            </button>
        )}

        {step === 'review' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Direct Access</h3>
              <p className="text-slate-500 text-sm mt-1">Pay once and unlock instantly.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 flex items-start space-x-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white shadow-sm bg-slate-200">
                <img src={itemImage} className="w-full h-full object-cover" alt="Cover" />
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{itemTitle}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{itemTypeLabel}</p>
                <div className="flex items-center mt-2">
                    <span className="font-bold text-rose-600 text-lg">${itemPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 ml-2 italic text-nowrap">USD One-time</span>
                </div>
              </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 flex flex-col items-center">
                    <div className="flex items-center mb-3">
                        <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                        <span className="font-bold">System Environment Restriction</span>
                    </div>
                    <p className="text-center mb-4 leading-relaxed text-xs">
                        {error.includes('host') ? "Third-party payment scripts are being blocked by the host security policy." : error}
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <button 
                            onClick={initializePayPal}
                            className="flex items-center justify-center px-4 py-2 bg-white border border-rose-200 rounded-full text-rose-600 hover:bg-rose-50 transition-colors shadow-sm font-bold text-xs"
                        >
                            <RefreshCw size={12} className="mr-2" />
                            Retry
                        </button>
                        <button 
                            onClick={handleSimulateSuccess}
                            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md font-bold text-xs"
                        >
                            <Sparkles size={12} className="mr-2" />
                            Simulate
                        </button>
                    </div>
                </div>
            )}

            <div className="min-h-[150px] relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-xl">
                        <div className="text-center">
                            <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                            <p className="text-xs text-slate-500 font-medium tracking-wide">Securing connection...</p>
                        </div>
                    </div>
                )}
                <div ref={paypalContainerRef} className="w-full relative z-0" />
            </div>
            
            <div className="mt-6 flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center text-[10px] text-slate-400 space-x-1 font-medium uppercase tracking-widest">
                <Lock size={10} />
                <span>SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center bg-emerald-50">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-emerald-900">Access Granted!</h3>
            <p className="text-emerald-700 text-sm mt-3 font-medium">Enjoy your premium content.</p>
            <div className="mt-8 flex justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
