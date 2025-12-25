import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey } = config.supabase;

  // If client exists, return it
  if (client) return client;

  // Otherwise try to create it
  if (url && anonKey && url !== 'https://your-project.supabase.co') {
    try {
        client = createClient(url, anonKey);
        return client;
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
        return null;
    }
  }

  return null;
};

// Call this after updating settings to force a new client creation
export const initSupabase = () => {
    client = null; // Clear existing instance
    getSupabase(); // Re-create
};