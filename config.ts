/**
 * Application Configuration
 * 
 * Centralizes access to environment variables.
 * PRIORITY:
 * 1. import.meta.env (Vite standard)
 * 2. LocalStorage (Runtime overrides via Settings UI)
 * 3. process.env (Standard/System fallback)
 */

import { keys } from './keys';

const getEnv = (key: string): string => {
  // 1. Check Vite's import.meta.env if available
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key] as string;
    }
  } catch (e) {
    // import.meta might not be supported in some environments
  }

  // 2. Check LocalStorage overrides
  if (typeof window !== 'undefined') {
    try {
      const overrides = JSON.parse(localStorage.getItem('amour_env_config') || '{}');
      if (overrides[key] !== undefined && overrides[key] !== '') return overrides[key];
    } catch (e) {}
  }

  // 3. Fallback to process.env if available
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}
  
  return '';
};

export const config = {
  // Gemini API Key
  get geminiApiKey() { 
    return getEnv('VITE_GEMINI_API_KEY') || getEnv('API_KEY') || getEnv('VITE_API_KEY') || ''; 
  },

  // Supabase Configuration
  get supabase() {
    const url = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || keys.SUPABASE_URL;
    const anonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || keys.SUPABASE_ANON_KEY;
    return { url, anonKey };
  },

  // PayPal Configuration
  get paypal() {
    const clientId = getEnv('VITE_PAYPAL_CLIENT_ID') || getEnv('PAYPAL_CLIENT_ID') || keys.PAYPAL_CLIENT_ID;
    return {
      clientId,
      isSandbox: getEnv('VITE_PAYPAL_SANDBOX') === 'true',
    };
  },

  // YouTube Configuration
  get youtube() {
    const apiKey = getEnv('VITE_YOUTUBE_API_KEY') || getEnv('YOUTUBE_API_KEY') || keys.YOUTUBE_API_KEY;
    return { apiKey };
  }
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = config.supabase;
  return !!url && !!anonKey && url.startsWith('http');
};

export const isPayPalConfigured = () => {
  return !!config.paypal.clientId && !config.paypal.clientId.includes('AaBbCc');
};

export const saveEnvConfig = (values: Record<string, any>) => {
  localStorage.setItem('amour_env_config', JSON.stringify(values));
};