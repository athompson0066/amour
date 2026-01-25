
import { Post, Author, Agent } from '../types';
import { getSupabase } from './supabaseClient';

const STORAGE_KEY = 'amour_directory_data';
const AGENT_OVERRIDES_KEY = 'amour_agent_overrides';
const AGENT_CUSTOM_KEY = 'amour_custom_agents';
const AGENT_EXCLUSIONS_KEY = 'amour_excluded_agents';

export const DEFAULT_AUTHOR: Author = {
  id: 'a1',
  name: 'Dr. Elena Rose',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
  bio: 'Relationship Psychologist & Love Coach',
};

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

const mapPostToRow = (post: Post) => {
  return {
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
  };
};

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

const mapAgentToRow = (agent: Agent) => {
    return {
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
    };
};

// --- POSTS SERVICE ---

export const getPosts = async (): Promise<Post[]> => {
  const supabase = getSupabase();
  let supabasePosts: Post[] = [];
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
      if (!error && data) {
        supabasePosts = data.map(mapRowToPost);
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to Local Storage.");
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const localPosts: Post[] = stored ? JSON.parse(stored) : SEED_DATA;
  
  // Merge: Cloud data wins for existing IDs, but keep local-only new posts
  const combined = [...localPosts];
  supabasePosts.forEach(sPost => {
      const localIndex = combined.findIndex(l => l.id === sPost.id);
      if (localIndex >= 0) {
          combined[localIndex] = sPost;
      } else {
          combined.push(sPost);
      }
  });

  return combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const savePost = async (post: Post): Promise<void> => {
  // 1. Save Locally for instant feedback
  let currentLocalPosts: Post[] = [];
  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      currentLocalPosts = stored ? JSON.parse(stored) : SEED_DATA;
      const existingIndex = currentLocalPosts.findIndex(p => p.id === post.id);
      if (existingIndex >= 0) currentLocalPosts[existingIndex] = post;
      else currentLocalPosts.unshift(post);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocalPosts));
  } catch (e) {}

  // 2. Sync to Cloud
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapPostToRow(post);
      const { error } = await supabase.from('posts').upsert(row);
      if (error) {
          console.error("Supabase Post Upsert Error:", error.message, error.details);
          throw error;
      }
      console.log("Supabase sync successful for post:", post.id);
    } catch (e: any) {
      console.error("Supabase sync failed critically:", e.message || e);
      // Attempt fallback if specific columns are missing (legacy support)
      if (e.message?.includes('column')) {
          console.warn("Attempting partial sync without newer columns...");
          const partialRow: any = mapPostToRow(post);
          delete partialRow.payhip_product_url;
          delete partialRow.unlock_password;
          await supabase.from('posts').upsert(partialRow).catch(() => {});
      }
    }
  }
};

export const deletePost = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (supabase) {
    try { await supabase.from('posts').delete().eq('id', id); } catch (e) {}
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
      const posts: Post[] = JSON.parse(stored);
      const newPosts = posts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  }
};

// --- AGENTS SERVICE ---

export const getAgentsData = async (): Promise<Agent[]> => {
    const supabase = getSupabase();
    let supabaseAgents: Agent[] = [];
    
    if (supabase) {
        try {
            const { data, error } = await supabase.from('agents').select('*');
            if (!error && data) {
                supabaseAgents = data.map(mapRowToAgent);
            }
        } catch (e) {
            console.warn("Supabase Agent fetch failed.");
        }
    }

    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
    const excluded = JSON.parse(localStorage.getItem(AGENT_EXCLUSIONS_KEY) || '[]');
    
    // Combine base agents with overrides
    const baseWithOverrides = BASE_AGENTS.map(agent => ({ 
        ...agent, 
        ...(overrides[agent.id] || {}) 
    }));

    const combined = [...baseWithOverrides, ...custom];
    
    // Merge cloud agents
    supabaseAgents.forEach(sAgent => {
        const idx = combined.findIndex(c => c.id === sAgent.id);
        if (idx >= 0) combined[idx] = sAgent;
        else combined.push(sAgent);
    });

    return combined.filter(a => !excluded.includes(a.id));
};

// Legacy getters kept for compatibility, but now async ready in App.tsx
export const getAgents = () => {
    // This is now handled in App.tsx refreshData
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
    const excluded = JSON.parse(localStorage.getItem(AGENT_EXCLUSIONS_KEY) || '[]');
    return [...BASE_AGENTS.map(a => ({...a, ...(overrides[a.id] || {})})), ...custom]
        .filter(a => !excluded.includes(a.id) && (a.category === 'relationship' || !a.category));
};

export const getAstroAgents = () => {
    // Usually these are base agents, but we filter them out for directory views
    const custom = JSON.parse(localStorage.getItem(AGENT_CUSTOM_KEY) || '[]');
    return custom.filter((a: any) => a.category === 'astro');
};

export const saveAgent = async (agentId: string, updates: Partial<Agent>): Promise<void> => {
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

    // Sync Expert to Supabase
    const supabase = getSupabase();
    if (supabase) {
        try {
            const row = mapAgentToRow(fullAgent);
            const { error } = await supabase.from('agents').upsert(row);
            if (error) console.error("Supabase Agent Sync Error:", error.message);
        } catch (e) {}
    }
};

export const addCustomAgent = async (agent: Agent): Promise<void> => {
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
