
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
      { id: 'b2', type: 'text', content: 'Explore the origins of attachment theory.' }
    ]
  }
];

const BASE_AGENTS: Agent[] = [
  // --- CORE RELATIONSHIP EXPERTS (5 Tokens/msg) ---
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
  },
  
  // --- THE ASTRO-COUNCIL (10 Tokens/msg) ---
  {
    id: 'astro-aries',
    name: 'Jordan Vane',
    role: 'Aries Passion & Conflict Strategist',
    category: 'astro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Stop burning bridges with your intensity. Learn how to date an Aries without the constant ego-clashes.',
    tokenCost: 10,
    isOnline: true,
    expertise: ['Impulse Control', 'Direct Communication', 'Healthy Competition']
  },
  {
    id: 'astro-taurus',
    name: 'Elena Rossi',
    role: 'Taurus Stability & Sensuality Advisor',
    category: 'astro',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Stuck in a comfort zone that feels like a prison? I help Taurus souls build reliable love.',
    tokenCost: 10,
    isOnline: true,
    expertise: ['Overcoming Inertia', 'Sensual Wealth', 'Long-term Trust']
  },
  {
      id: 'astro-gemini',
      name: 'Liam Sterling',
      role: 'Gemini Communication & Connection Coach',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Tired of being labeled a "ghost"? I help Gemini souls find emotional depth.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Consistency Coaching', 'Digital Banter', 'Mind-Heart Sync']
  },
  {
      id: 'astro-cancer',
      name: 'Sophia Moon',
      role: 'Cancer Vulnerability & Security Mentor',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Is your "shell" scaring away the right people? Heal past betrayal with Sophia.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Inner Child Healing', 'Safe Intimacy', 'Family Dynamics']
  },
  {
      id: 'astro-leo',
      name: 'Julian Hart',
      role: 'Leo Self-Love & Romance Specialist',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Stop seeking validation. Julian helps Leos find magnetism through radical self-love.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Confidence Building', 'Generosity', 'Creative Dating']
  },
  {
      id: 'astro-virgo',
      name: 'Clara Thorne',
      role: 'Virgo Harmony & Standards Analyst',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Is your "checklist" killing chemistry? Clara helps Virgos lower the inner critic.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Anxiety Management', 'Acts of Service', 'Relationship Flow']
  },
  {
      id: 'astro-libra',
      name: 'Oliver Gray',
      role: 'Libra Partnership & Identity Consultant',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Losing yourself again? Oliver teaches Libras how to find their voice in union.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Boundary Setting', 'Fair Negotiation', 'Self-Individuation']
  },
  {
      id: 'astro-scorpio',
      name: 'Damien Cross',
      role: 'Scorpio Trust & Transformation Expert',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Dating a Scorpio can feel like an interrogation. Damien trades suspicion for merging.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Shadow Integration', 'Intense Intimacy', 'Radical Trust']
  },
  {
      id: 'astro-sagittarius',
      name: 'Maya Archer',
      role: 'Sagittarius Freedom & Commitment Guide',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Terrified of the "ball and chain"? Maya finds commitment that feels like expansion.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Commitment Phobia', 'Spiritual Growth', 'Honest Dating']
  },
  {
      id: 'astro-capricorn',
      name: 'Arthur Peak',
      role: 'Capricorn Devotion & Legacy Strategist',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Career thriving but heart starving? Arthur builds a lasting legacy of love.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Emotional Availability', 'Work-Life-Love Balance', 'Stability']
  },
  {
      id: 'astro-aquarius',
      name: 'Quinn Nova',
      role: 'Aquarius Independence & Intimacy Expert',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Dating an Aquarius can feel like dating a robot. Quinn bridges the detachment gap.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Intellectual Sparks', 'Futuristic Love', 'Individuality']
  },
  {
      id: 'astro-pisces',
      name: 'Isabella Marina',
      role: 'Pisces Boundaries & Soul-Bonding Mentor',
      category: 'astro',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
      description: 'Drowning in other people\'s emotions? Isabella protects your heart to find your twin.',
      tokenCost: 10,
      isOnline: true,
      expertise: ['Empathy Limits', 'Spiritual Union', 'Reality Alignment']
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
  relatedVideos: row.related_videos || [],
  seo: row.seo || undefined
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
    related_videos: post.relatedVideos || [],
    seo: post.seo || null
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
    tokenCost: row.token_cost || 5, // Map token cost
    price: row.price,
    priceValue: row.price_value,
    payhipProductUrl: row.payhip_product_url,
    unlockPassword: row.unlock_password,
    isOnline: row.is_online ?? true,
    expertise: row.expertise || [],
    tools: row.tools || {},
    thinkingBudget: row.thinking_budget || 0,
    seo: row.seo || undefined
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
    token_cost: agent.tokenCost,
    price: agent.price || null,
    price_value: agent.priceValue || null,
    payhip_product_url: agent.payhipProductUrl || null,
    unlock_password: agent.unlockPassword || null,
    is_online: !!agent.isOnline,
    expertise: agent.expertise || [],
    tools: agent.tools || {},
    thinking_budget: agent.thinkingBudget || 0,
    seo: agent.seo || null
});

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
  
  const combinedMap = new Map<string, Post>();
  supabasePosts.forEach(p => combinedMap.set(p.id, p));
  localPosts.forEach(p => combinedMap.set(p.id, p));

  const combined = Array.from(combinedMap.values());

  return combined
    .filter(p => !blacklisted.includes(p.id))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const savePost = async (post: Post): Promise<void> => {
  removeFromBlacklist(post.id);

  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [...SEED_DATA];
      const idx = currentPosts.findIndex(p => p.id === post.id);
      if (idx >= 0) currentPosts[idx] = post;
      else currentPosts.unshift(post);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPosts));
  } catch (e) {
      console.error("Local save failed:", e);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapPostToRow(post);
      const { error } = await supabase.from('posts').upsert(row);
      if (error) console.error("CLOUD SYNC FAILED:", error.message, error.details);
    } catch (e: any) {
      console.error("Cloud sync exception:", e);
    }
  }
};

export const deletePost = async (id: string): Promise<void> => {
  addToBlacklist(id);

  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentPosts: Post[] = stored ? JSON.parse(stored) : [...SEED_DATA];
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
    supabaseAgents.forEach(a => combinedMap.set(a.id, a));
    baseWithOverrides.forEach(a => combinedMap.set(a.id, a));
    custom.forEach(a => combinedMap.set(a.id, a));

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
            const row = mapAgentToRow(fullAgent);
            await supabase.from('agents').upsert(row);
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
