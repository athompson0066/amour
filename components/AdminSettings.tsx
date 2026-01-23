
import React, { useState } from 'react';
import { Save, AlertCircle, Database, CreditCard, Video, RefreshCw, CheckCircle2, ShoppingBag, ExternalLink } from 'lucide-react';
import { config, saveEnvConfig } from '../config';
import { initSupabase } from '../services/supabaseClient';

interface AdminSettingsProps {
  onCancel: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onCancel }) => {
  const [values, setValues] = useState({
    VITE_SUPABASE_URL: config.supabase.url || '',
    VITE_SUPABASE_ANON_KEY: config.supabase.anonKey || '',
    VITE_PAYPAL_CLIENT_ID: config.paypal.clientId || '',
    VITE_PAYPAL_SANDBOX: config.paypal.isSandbox ? 'true' : 'false',
    VITE_PAYHIP_SELLER_ID: config.payhip.sellerId || '',
    VITE_PAYHIP_API_KEY: config.payhip.apiKey || '',
    VITE_YOUTUBE_API_KEY: config.youtube.apiKey || ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveEnvConfig(values);
    initSupabase(); 
    setSaved(true);
    
    setTimeout(() => {
        onCancel();
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <RefreshCw className="mr-2 text-rose-500" />
            Platform Settings
        </h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">Back</button>
          <button 
            onClick={handleSave} 
            className={`px-6 py-2 text-white rounded-md shadow-md flex items-center font-medium transition-all ${
                saved ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {saved ? (
                <>
                    <CheckCircle2 size={18} className="mr-2" />
                    Saved!
                </>
            ) : (
                <>
                    <Save size={18} className="mr-2" />
                    Save & Apply
                </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-8 px-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start">
            <AlertCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-800">
                Update your platform keys and configurations here. Changes apply immediately to the directory.
            </p>
        </div>

        {/* Payhip */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <ShoppingBag className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Payhip Checkout</h3>
                    <p className="text-xs text-slate-500">Premium Course & Digital Product Sales</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payhip API Key (Optional)</label>
                    <input 
                        type="password" 
                        value={values.VITE_PAYHIP_API_KEY}
                        onChange={(e) => handleChange('VITE_PAYHIP_API_KEY', e.target.value)}
                        placeholder="Required for advanced integrations..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                      Seller ID / Global Handler
                      <ExternalLink size={12} className="ml-1 opacity-50" />
                    </label>
                    <input 
                        type="text" 
                        value={values.VITE_PAYHIP_SELLER_ID}
                        onChange={(e) => handleChange('VITE_PAYHIP_SELLER_ID', e.target.value)}
                        placeholder="Your Payhip username or ID"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Ensure the Payhip SDK script is allowed to run. The SDK will automatically detect product links and open the checkout popup.
                </p>
            </div>
        </div>

        {/* Supabase */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    <Database className="text-emerald-600" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Supabase Integration</h3>
                    <p className="text-xs text-slate-500">For Authentication & Database</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project URL</label>
                    <input 
                        type="text" 
                        value={values.VITE_SUPABASE_URL}
                        onChange={(e) => handleChange('VITE_SUPABASE_URL', e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Anon Public Key</label>
                    <input 
                        type="password" 
                        value={values.VITE_SUPABASE_ANON_KEY}
                        onChange={(e) => handleChange('VITE_SUPABASE_ANON_KEY', e.target.value)}
                        placeholder="eyJh..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
            </div>
        </div>

        {/* PayPal Fallback */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <CreditCard className="text-blue-600" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">PayPal Fallback</h3>
                    <p className="text-xs text-slate-500">Alternative Payment Method</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
                    <input 
                        type="text" 
                        value={values.VITE_PAYPAL_CLIENT_ID}
                        onChange={(e) => handleChange('VITE_PAYPAL_CLIENT_ID', e.target.value)}
                        placeholder="AaBbCc..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
            </div>
        </div>

         {/* YouTube */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center mb-6">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <Video className="text-red-600" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">YouTube Integration</h3>
                    <p className="text-xs text-slate-500">For Video Course Content</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                    <input 
                        type="text" 
                        value={values.VITE_YOUTUBE_API_KEY}
                        onChange={(e) => handleChange('VITE_YOUTUBE_API_KEY', e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
