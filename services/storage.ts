
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

const SEED_DATA: Post[] = [
  {
    id: 'article-trust-1',
    title: 'Building Lasting Bonds: The Science of Trust and Attachment Theory',
    subtitle: 'Understanding your attachment style is the foundation of creating secure, long-term relationships based on mutual trust.',
    type: 'article',
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1200&h=600',
    author: DEFAULT_AUTHOR,
    publishedAt: '2026-01-25T09:00:00.000Z',
    readTime: '6 min read',
    isPremium: false,
    tags: ['Trust', 'Attachment Theory', 'Science of Love'],
    blocks: [
      { id: 'b1', type: 'header', content: 'The Biological Imperative of Trust' },
      { id: 'b2', type: 'text', content: 'Trust is not just a feeling; it is a neurological state. When we feel secure in our attachment, our brains release oxytocin, lowering our cortisol levels and allowing for true vulnerability.' },
      { id: 'b3', type: 'quote', content: 'Trust is built in very small moments, which I call "sliding door moments". — Dr. John Gottman' },
      { id: 'b4', type: 'header', content: 'Identifying Your Style' },
      { id: 'b5', type: 'text', content: 'Whether you are anxious, avoidant, or secure, knowing your default setting is the first step toward conscious connection.' }
    ]
  }
];

const BASE_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Dr. Elena Rose',
    role: 'Lead Relationship Psychologist',
    category: 'relationship',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Specializing in breaking repetitive toxic cycles and healing the root causes of anxious attachment.',
    tokenCost: 5,
    isOnline: true,
    expertise: ['Attachment Styles', 'Conflict Resolution', 'Trauma Healing']
  },
  {
    id: 'agent-coach',
    name: 'Sarah Chen',
    role: 'Conscious Dating Strategist',
    category: 'relationship',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Transforming how you date by focusing on radical self-worth and identifying red flags.',
    tokenCost: 5,
    isOnline: true,
    expertise: ['Modern Dating', 'Self-Worth', 'Boundary Setting']
  }
];

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

const mapRowToPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  // Support multiple naming conventions for descriptions
  subtitle: row.subtitle || row.description || row.summary || '',
  type: row.type || 'article',
  coverImage: row.cover_image || row.image || '',
  author: row.author || DEFAULT_AUTHOR,
  publishedAt: row.published_at || row.created_at || new Date().toISOString(),
  readTime: row.read_time || '5 min read', 
  isPremium: !!row.is_premium,
  price: row.price,
  payhipProductUrl: row.payhip_url || row.payhip_product_url || undefined, 
  unlockPassword: row.unlock_password || undefined,
  tags: row.tags || [],
  blocks: row.blocks || [],
  relatedVideos: row.related_videos || [],
  seo: row.seo || undefined
});

const mapPostToRow = (post: Post, minimal = false) => {
    const row: any = {
        id: post.id,
        title: post.title,
        type: post.type,
        blocks: post.blocks || []
    };

    if (!minimal) {
        row.subtitle = post.subtitle;
        row.cover_image = post.coverImage;
        row.author = post.author;
        row.published_at = post.publishedAt;
        row.read_time = post.readTime;
        row.is_premium = !!post.isPremium;
        row.price = post.price || 0;
        row.tags = post.tags || [];
        row.related_videos = post.relatedVideos || [];
        row.seo = post.seo || null;
    }

    return row;
};

const mapRowToAgent = (row: any): Agent => ({
    id: row.id,
    name: row.name,
    role: row.role,
    category: row.category || 'relationship',
    avatar: row.avatar,
    description: row.description || row.bio || '',
    systemInstruction: row.system_instruction,
    embedCode: row.embed_code,
    tokenCost: row.token_cost || 5, 
    price: row.price,
    priceValue: row.price_value,
    payhipProductUrl: row.payhip_url || row.payhip_product_url || undefined,
    unlockPassword: row.unlock_password,
    isOnline: row.is_online ?? true,
    expertise: row.expertise || [],
    tools: row.tools || {},
    thinkingBudget: row.thinking_budget || 0,
    seo: row.seo || undefined
});

const mapAgentToRow = (agent: Agent, minimal = false) => {
    const row: any = {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        avatar: agent.avatar,
        description: agent.description
    };

    if (!minimal) {
        row.category = agent.category;
        row.system_instruction = agent.systemInstruction || null;
        row.embed_code = agent.embedCode || null;
        row.token_cost = agent.tokenCost;
        row.price = agent.price || null;
        row.price_value = agent.priceValue || null;
        row.is_online = !!agent.isOnline;
        row.expertise = agent.expertise || [];
        row.tools = agent.tools || {};
        row.thinking_budget = agent.thinkingBudget || 0;
        row.seo = agent.seo || null;
    }

    return row;
};

export const getPosts = async (): Promise<Post[]> => {
  const supabase = getSupabase();
  const blacklisted = getDeletedIds();
  let supabasePosts: Post[] = [];
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) console.error("Supabase fetch error:", error.message);
      else if (data) supabasePosts = data.map(mapRowToPost);
    } catch (e) {
      console.warn("Supabase fetch failed, using local fallback.");
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const localPosts: Post[] = stored ? JSON.parse(stored) : [];
  
  const combinedMap = new Map<string, Post>();
  
  // 1. Start with SEED DATA
  SEED_DATA.forEach(p => combinedMap.set(p.id, p));
  
  // 2. Overlay SUPABASE DATA
  supabasePosts.forEach(sp => {
      const existing = combinedMap.get(sp.id);
      if (existing) {
          combinedMap.set(sp.id, {
              ...existing,
              ...sp,
              coverImage: sp.coverImage || existing.coverImage,
              subtitle: sp.subtitle || existing.subtitle,
              tags: sp.tags?.length > 0 ? sp.tags : existing.tags
          });
      } else {
          combinedMap.set(sp.id, sp);
      }
  });

  // 3. Final Overlay LOCAL STORAGE (Active working copy)
  localPosts.forEach(lp => {
      const existing = combinedMap.get(lp.id);
      if (existing) {
          combinedMap.set(lp.id, { 
            ...existing, 
            ...lp,
            subtitle: lp.subtitle || existing.subtitle
          });
      } else {
          combinedMap.set(lp.id, lp);
      }
  });

  const combined = Array.from(combinedMap.values());

  return combined
    .filter(p => !blacklisted.includes(p.id))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const savePost = async (post: Post): Promise<void> => {
  removeFromBlacklist(post.id);

  // 1. Local Storage Update
  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [];
      const idx = currentPosts.findIndex(p => p.id === post.id);
      if (idx >= 0) currentPosts[idx] = post;
      else currentPosts.unshift(post);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPosts));
  } catch (e) {
      console.error("Local save failed:", e);
  }

  // 2. Adaptive Cloud Sync
  const supabase = getSupabase();
  if (supabase) {
    try {
      const fullRow = mapPostToRow(post, false);
      const { error: fullError } = await supabase.from('posts').upsert(fullRow, { onConflict: 'id' });
      
      if (fullError) {
          if (fullError.code === '42703' || fullError.message.toLowerCase().includes('column')) {
              const minRow = mapPostToRow(post, true);
              await supabase.from('posts').upsert(minRow, { onConflict: 'id' });
          } else {
              throw new Error(fullError.message);
          }
      }
    } catch (e: any) {
      throw e;
    }
  }
};

export const syncAllToCloud = async (): Promise<{ success: number, failed: number }> => {
    const supabase = getSupabase();
    if (!supabase) return { success: 0, failed: 0 };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { success: 0, failed: 0 };

    const localPosts: Post[] = JSON.parse(stored);
    let success = 0;
    let failed = 0;

    for (const post of localPosts) {
        try {
            await savePost(post);
            success++;
        } catch (e) {
            failed++;
        }
    }

    return { success, failed };
};

export const deletePost = async (id: string): Promise<void> => {
  addToBlacklist(id);

  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [];
      const newPosts = currentPosts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  } catch (e) {}

  const supabase = getSupabase();
  if (supabase) {
    try { 
        await supabase.from('posts').delete().eq('id', id); 
    } catch (e) {}
  }
};

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
    baseWithOverrides.forEach(a => combinedMap.set(a.id, a));
    custom.forEach(a => combinedMap.set(a.id, a));
    supabaseAgents.forEach(a => combinedMap.set(a.id, a));

    return Array.from(combinedMap.values())
        .filter(a => !excluded.includes(a.id) && !blacklisted.includes(a.id));
};

export const getAgents = () => {
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
    const overrides = JSON.parse(localStorage.getItem(AGENT_OVERRIDES_KEY) || '{}');
    return [...BASE_AGENTS.map(a => ({...a, ...(overrides[a.id] || {})})), ...custom]
        .filter((a: any) => a.category === 'astro' && !blacklisted.includes(a.id));
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
            const fullRow = mapAgentToRow(fullAgent, false);
            const { error: fullError } = await supabase.from('agents').upsert(fullRow, { onConflict: 'id' });
            
            if (fullError && (fullError.code === '42703' || fullError.message.toLowerCase().includes('column'))) {
                const minRow = mapAgentToRow(fullAgent, true);
                await supabase.from('agents').upsert(minRow, { onConflict: 'id' });
            }
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
            const fullRow = mapAgentToRow(agent, false);
            const { error: fullError } = await supabase.from('agents').upsert(fullRow, { onConflict: 'id' });
            
            if (fullError && (fullError.code === '42703' || fullError.message.toLowerCase().includes('column'))) {
                const minRow = mapAgentToRow(agent, true);
                await supabase.from('agents').upsert(minRow, { onConflict: 'id' });
            }
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
