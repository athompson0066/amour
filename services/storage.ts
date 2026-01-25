
import { Post, Author, Agent } from '../types';
import { getSupabase } from './supabaseClient';

const STORAGE_KEY = 'amour_directory_data';
const AGENT_OVERRIDES_KEY = 'amour_agent_overrides';
const AGENT_CUSTOM_KEY = 'amour_custom_agents';
const AGENT_EXCLUSIONS_KEY = 'amour_excluded_agents';
const DELETED_IDS_KEY = 'amour_deleted_ids';

export const DEFAULT_AUTHOR: Author = {
  id: 'a1',
  name: 'Dr. Elena Rose',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
  bio: 'Relationship Psychologist & Love Coach',
};

// PREVIOUS POSTS RESTORED
const SEED_DATA: Post[] = [
  {
    id: 'course-1',
    title: 'The Attachment Theory Masterclass',
    subtitle: 'Identify your secure, anxious, or avoidant style and transform how you connect with others.',
    type: 'course',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800&h=400',
    author: DEFAULT_AUTHOR,
    publishedAt: new Date().toISOString(),
    readTime: '4h Course',
    isPremium: true,
    price: 49.99,
    payhipProductUrl: 'https://payhip.com/b/example',
    unlockPassword: 'HEAL-ATTACH-2024',
    tags: ['Psychology', 'Healing', 'Growth'],
    blocks: [
      { id: 'b1', type: 'header', content: 'Module 1: Foundations of Attachment' },
      { id: 'b2', type: 'text', content: 'In this module, we explore the origins of attachment theory and how your early caregivers shaped your adult relationship dynamics.' }
    ]
  },
  {
    id: 'article-1',
    title: 'The 7 Languages of Emotional Intimacy',
    subtitle: 'Beyond just physical touch—how to build a soul-level connection that withstands time.',
    type: 'article',
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=800&h=400',
    author: DEFAULT_AUTHOR,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    readTime: '12 min read',
    isPremium: false,
    tags: ['Intimacy', 'Communication', 'Wisdom'],
    blocks: [
      { id: 'a1', type: 'text', content: 'Intimacy is more than just proximity; it is the art of being seen and known in your most vulnerable state.' }
    ]
  },
  {
    id: 'podcast-1',
    title: 'Midnight Musings: Healing After Loss',
    subtitle: 'A raw and unfiltered conversation on navigating the void and reclaiming your identity.',
    type: 'podcast',
    coverImage: 'https://images.unsplash.com/photo-1478737270239-2fccd2c78621?auto=format&fit=crop&q=80&w=800&h=400',
    author: { ...DEFAULT_AUTHOR, name: 'Amour Audio' },
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    readTime: '45 min listen',
    isPremium: true,
    price: 9.99,
    payhipProductUrl: 'https://payhip.com/b/example-pod',
    unlockPassword: 'MIDNIGHT-MEND',
    tags: ['Audio', 'Healing', 'Breakups'],
    blocks: []
  },
  {
    id: 'app-1',
    title: 'The Heart Mend Journey Tracker',
    subtitle: 'Visualize your healing, track your mood, and reclaim your peace after a breakup.',
    type: 'app',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800&h=400',
    author: { ...DEFAULT_AUTHOR, name: 'Amour Tools' },
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    readTime: 'Interactive Tool',
    isPremium: true,
    price: 14.99,
    tags: ['Healing', 'Wellness', 'Tracker'],
    blocks: []
  }
];

const BASE_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Dr. Elena Rose',
    role: 'Relationship Psychologist',
    category: 'relationship',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Specializing in attachment theory and cognitive behavioral therapy for couples.',
    price: '$2.99/min',
    priceValue: 2.99,
    isOnline: true,
    expertise: ['Attachment Styles', 'Conflict Resolution', 'Trauma Healing']
  },
  {
    id: 'agent-2',
    name: 'Marcus Thorne',
    role: 'Communication Specialist',
    category: 'relationship',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Expert in non-violent communication and restoring lost intimacy in long-term marriages.',
    price: '$3.50/min',
    priceValue: 3.50,
    isOnline: true,
    expertise: ['NVC', 'Intimacy Recovery', 'Active Listening']
  }
];

// --- INTERNAL HELPERS ---

const getDeletedIds = (): string[] => {
    try {
        const stored = localStorage.getItem(DELETED_IDS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

const addToBlacklist = (id: string) => {
    const ids = getDeletedIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
    }
};

const removeFromBlacklist = (id: string) => {
    const ids = getDeletedIds();
    const newIds = ids.filter(i => i !== id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(newIds));
};

// --- MAPPING UTILS ---

const mapRowToPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  type: row.type,
  coverImage: row.cover_image,
  author: row.author || DEFAULT_AUTHOR,
  publishedAt: row.published_at,
  readTime: row.read_time || '5 min read', 
  isPremium: row.is_premium,
  price: row.price,
  payhipProductUrl: row.payhip_product_url || undefined, 
  unlockPassword: row.unlock_password || undefined,
  tags: row.tags || [],
  blocks: row.blocks || [],
  relatedVideos: row.related_videos || []
});

const mapPostToRow = (post: Post) => ({
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    type: post.type,
    cover_image: post.coverImage,
    author: post.author,
    published_at: post.publishedAt,
    read_time: post.readTime,
    is_premium: !!post.isPremium,
    price: post.price || 0,
    payhip_product_url: post.payhipProductUrl || null,
    unlock_password: post.unlockPassword || null,
    tags: post.tags || [],
    blocks: post.blocks || [],
    related_videos: post.relatedVideos || []
});

const mapRowToAgent = (row: any): Agent => ({
    id: row.id,
    name: row.name,
    role: row.role,
    category: row.category || 'relationship',
    avatar: row.avatar,
    description: row.description,
    systemInstruction: row.system_instruction,
    embedCode: row.embed_code,
    price: row.price,
    priceValue: row.price_value,
    payhipProductUrl: row.payhip_product_url,
    unlockPassword: row.unlock_password,
    isOnline: row.is_online ?? true,
    expertise: row.expertise || [],
    tools: row.tools || {},
    thinkingBudget: row.thinking_budget || 0
});

const mapAgentToRow = (agent: Agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    category: agent.category,
    avatar: agent.avatar,
    description: agent.description,
    system_instruction: agent.systemInstruction || null,
    embed_code: agent.embedCode || null,
    price: agent.price,
    price_value: agent.priceValue || 0,
    payhip_product_url: agent.payhipProductUrl || null,
    unlock_password: agent.unlockPassword || null,
    is_online: !!agent.isOnline,
    expertise: agent.expertise || [],
    tools: agent.tools || {},
    thinking_budget: agent.thinkingBudget || 0
});

// --- POSTS SERVICE ---

export const getPosts = async (): Promise<Post[]> => {
  const supabase = getSupabase();
  const blacklisted = getDeletedIds();
  let supabasePosts: Post[] = [];
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
      if (error) console.error("Supabase fetch error:", error.message);
      else if (data) supabasePosts = data.map(mapRowToPost);
    } catch (e) {
      console.warn("Supabase fetch failed, using local fallback.");
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const localPosts: Post[] = stored ? JSON.parse(stored) : SEED_DATA;
  
  // Logic: Local data is primary source for updates, Cloud is backup.
  // We merge cloud items that don't exist locally or update local ones if Cloud has newer info.
  // Actually, for user simple usage, if sync fails, we want Local to persist.
  const combinedMap = new Map<string, Post>();
  
  // 1. Load Cloud data
  supabasePosts.forEach(p => combinedMap.set(p.id, p));
  // 2. Overwrite with Local data (contains latest unpublished changes)
  localPosts.forEach(p => combinedMap.set(p.id, p));

  const combined = Array.from(combinedMap.values());

  return combined
    .filter(p => !blacklisted.includes(p.id))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const savePost = async (post: Post): Promise<void> => {
  removeFromBlacklist(post.id);

  // 1. Update Local Storage immediately
  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [...SEED_DATA];
      const idx = currentPosts.findIndex(p => p.id === post.id);
      if (idx >= 0) currentPosts[idx] = post;
      else currentPosts.unshift(post);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPosts));
      console.log("Locally saved post:", post.id);
  } catch (e) {
      console.error("Local save failed:", e);
  }

  // 2. Sync to Cloud
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapPostToRow(post);
      const { error } = await supabase.from('posts').upsert(row);
      if (error) {
          console.error("CLOUD SYNC FAILED:", error.message, error.details);
          alert(`Cloud Sync Failed: ${error.message}. Your post is saved locally on this browser but won't appear on Vercel/Production until sync succeeds.`);
      } else {
          console.log("Cloud sync successful.");
      }
    } catch (e: any) {
      console.error("Cloud sync exception:", e);
    }
  } else {
      console.warn("Supabase client not initialized. Only local save performed.");
  }
};

export const deletePost = async (id: string): Promise<void> => {
  console.log("Service: Initiating deletion for", id);
  addToBlacklist(id);

  // Update Local Storage Array
  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [...SEED_DATA];
      const newPosts = currentPosts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  } catch (e) {}

  // Sync to Cloud
  const supabase = getSupabase();
  if (supabase) {
    try { 
        const { error } = await supabase.from('posts').delete().eq('id', id); 
        if (error) console.error("Cloud delete error:", error.message);
    } catch (e) {}
  }
};

// --- AGENTS SERVICE ---

export const getAgentsData = async (): Promise<Agent[]> => {
    const supabase = getSupabase();
    const blacklisted = getDeletedIds();
    let supabaseAgents: Agent[] = [];
    
    if (supabase) {
        try {
            const { data, error } = await supabase.from('agents').select('*');
            if (!error && data) supabaseAgents = data.map(mapRowToAgent);
        } catch (e) {}
    }

    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
    const excluded = JSON.parse(localStorage.getItem(AGENT_EXCLUSIONS_KEY) || '[]');
    
    const baseWithOverrides = BASE_AGENTS.map(agent => ({ 
        ...agent, 
        ...(overrides[agent.id] || {}) 
    }));

    const combinedMap = new Map<string, Agent>();
    supabaseAgents.forEach(a => combinedMap.set(a.id, a));
    baseWithOverrides.forEach(a => combinedMap.set(a.id, a));
    custom.forEach(a => combinedMap.set(a.id, a));

    return Array.from(combinedMap.values())
        .filter(a => !excluded.includes(a.id) && !blacklisted.includes(a.id));
};

export const getAgents = () => {
    // Legacy sync version used in some views
    const blacklisted = getDeletedIds();
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
    const excluded = JSON.parse(localStorage.getItem(AGENT_EXCLUSIONS_KEY) || '[]');
    return [...BASE_AGENTS.map(a => ({...a, ...(overrides[a.id] || {})})), ...custom]
        .filter(a => !excluded.includes(a.id) && !blacklisted.includes(a.id) && (a.category === 'relationship' || !a.category));
};

export const getAstroAgents = () => {
    const blacklisted = getDeletedIds();
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    return custom.filter((a: any) => a.category === 'astro' && !blacklisted.includes(a.id));
};

export const saveAgent = async (agentId: string, updates: Partial<Agent>): Promise<void> => {
    removeFromBlacklist(agentId);
    
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const customIndex = custom.findIndex((a: any) => a.id === agentId);
    
    let fullAgent: Agent;
    if (customIndex >= 0) {
        custom[customIndex] = { ...custom[customIndex], ...updates };
        fullAgent = custom[customIndex];
        localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(custom));
    } else {
        const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
        overrides[agentId] = { ...(overrides[agentId] || {}), ...updates };
        localStorage.setItem(AGENT_OVERRIDES_KEY, JSON.stringify(overrides));
        const base = BASE_AGENTS.find(a => a.id === agentId);
        fullAgent = { ...base!, ...overrides[agentId] };
    }

    const supabase = getSupabase();
    if (supabase) {
        try {
            const row = mapAgentToRow(fullAgent);
            const { error } = await supabase.from('agents').upsert(row);
            if (error) console.error("Agent cloud sync failed:", error.message);
        } catch (e) {}
    }
};

export const addCustomAgent = async (agent: Agent): Promise<void> => {
    removeFromBlacklist(agent.id);
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    custom.push(agent);
    localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(custom));

    const supabase = getSupabase();
    if (supabase) {
        try {
            const row = mapAgentToRow(agent);
            await supabase.from('agents').upsert(row);
        } catch (e) {}
    }
};

export const deleteAgent = async (id: string): Promise<void> => {
    addToBlacklist(id);
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const newCustom = custom.filter((a: any) => a.id !== id);
    localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(newCustom));
    
    const excluded = JSON.parse(localStorage.getItem(AGENT_EXCLUSIONS_KEY) || '[]');
    if (!excluded.includes(id)) {
        excluded.push(id);
        localStorage.setItem(AGENT_EXCLUSIONS_KEY, JSON.stringify(excluded));
    }

    const supabase = getSupabase();
    if (supabase) {
        try { await supabase.from('agents').delete().eq('id', id); } catch (e) {}
    }
};
