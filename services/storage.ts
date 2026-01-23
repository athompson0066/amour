
import { Post, Author, Agent } from '../types';
import { getSupabase } from './supabaseClient';

const STORAGE_KEY = 'amour_directory_data';
const AGENT_OVERRIDES_KEY = 'amour_agent_overrides';
const AGENT_CUSTOM_KEY = 'amour_custom_agents';
const AGENT_EXCLUSIONS_KEY = 'amour_excluded_agents';

export const DEFAULT_AUTHOR: Author = {
  id: 'a1',
  name: 'Dr. Elena Rose',
  avatar: 'https://picsum.photos/seed/elena/150/150',
  bio: 'Relationship Psychologist & Love Coach',
};

const SEED_DATA: Post[] = [
  {
    id: 'app-1',
    title: 'The Heart Mend Journey Tracker',
    subtitle: 'Visualize your healing, track your mood, and reclaim your peace after a breakup.',
    type: 'app',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800&h=400',
    author: { ...DEFAULT_AUTHOR, name: 'Amour Tools' },
    publishedAt: new Date().toISOString(),
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
  },
  {
    id: 'agent-3',
    name: 'Sienna Vance',
    role: 'Modern Dating Coach',
    category: 'relationship',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Helping singles navigate the digital landscape and build authentic self-confidence.',
    price: '$1.99/min',
    priceValue: 1.99,
    isOnline: false,
    expertise: ['App Strategy', 'Self-Worth', 'First Date Success']
  }
];

const BASE_ASTRO_AGENTS: Agent[] = [
  { id: 'aries', name: 'Aria', role: 'Aries Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200', description: 'Harness the fiery energy of the ram for decisive life changes.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Passion', 'Leadership', 'Initiative'] },
  { id: 'taurus', name: 'Terra', role: 'Taurus Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200', description: 'Finding stability and sensual fulfillment in your earthy connections.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Loyalty', 'Stability', 'Sensuality'] },
  { id: 'gemini', name: 'Gemi', role: 'Gemini Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', description: 'Bridging the gap between two minds through cosmic communication.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Intellect', 'Dialogue', 'Variety'] },
  { id: 'cancer', name: 'Luna', role: 'Cancer Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200&h=200', description: 'Navigating the deep lunar tides of emotional security and home.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Nurturing', 'Security', 'Intuition'] },
  { id: 'leo', name: 'Solara', role: 'Leo Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', description: 'Radiating self-love and heart-centered creative expression.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Confidence', 'Generosity', 'Drama'] },
  { id: 'virgo', name: 'Vesta', role: 'Virgo Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200&h=200', description: 'Applying analytical wisdom to perfect your relationship dynamics.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Analysis', 'Purity', 'Service'] },
  { id: 'libra', name: 'Lia', role: 'Libra Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200', description: 'Restoring harmony and aesthetic balance to your partnerships.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Harmony', 'Justice', 'Romance'] },
  { id: 'scorpio', name: 'Nova', role: 'Scorpio Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200', description: 'Diving into the transformative depths of soul-level intimacy.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Depth', 'Transformation', 'Power'] },
  { id: 'sagittarius', name: 'Sage', role: 'Sagittarius Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', description: 'Expanding horizons through the search for philosophical truth.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Freedom', 'Optimism', 'Truth'] },
  { id: 'capricorn', name: 'Cora', role: 'Capricorn Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&q=80&w=200&h=200', description: 'Building long-term legacy and structural integrity in love.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Ambition', 'Structure', 'Patience'] },
  { id: 'aquarius', name: 'Aqua', role: 'Aquarius Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=200&h=200', description: 'Pioneering unique, unconventional paths to collective connection.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Innovation', 'Community', 'Detachment'] },
  { id: 'pisces', name: 'Pia', role: 'Pisces Specialist', category: 'astro', avatar: 'https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?auto=format&fit=crop&q=80&w=200&h=200', description: 'Melting boundaries through spiritual compassion and dreams.', price: '$2.50/min', priceValue: 2.50, isOnline: true, expertise: ['Mysticism', 'Dreams', 'Healing'] }
];

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
  tags: row.tags || [],
  blocks: row.blocks || [],
  relatedVideos: row.related_videos || []
});

const mapPostToRow = (post: Post, includeVideos: boolean = true) => ({
  id: post.id || `post_${Date.now()}`,
  title: post.title,
  subtitle: post.subtitle,
  type: post.type,
  cover_image: post.coverImage,
  author: post.author || DEFAULT_AUTHOR,
  published_at: post.publishedAt || new Date().toISOString(),
  read_time: post.readTime || '5 min read',
  is_premium: !!post.isPremium,
  price: post.price || 0,
  tags: post.tags || [],
  blocks: post.blocks || [],
  related_videos: includeVideos ? (post.relatedVideos || []) : []
});

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
  
  if (supabasePosts.length > 0) return supabasePosts;
  return localPosts;
};

export const savePost = async (post: Post): Promise<void> => {
  let currentLocalPosts: Post[] = [];
  try {
      const stored = localStorage.getItem(STORAGE_KEY);
      currentLocalPosts = stored ? JSON.parse(stored) : SEED_DATA;
      
      const existingIndex = currentLocalPosts.findIndex(p => p.id === post.id);
      if (existingIndex >= 0) {
        currentLocalPosts[existingIndex] = post;
      } else {
        currentLocalPosts.unshift(post);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocalPosts));
  } catch (e) {
      console.error("Local Storage Save Failed:", e);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapPostToRow(post, true);
      const { error } = await supabase.from('posts').upsert(row);
      if (error) throw error;
      console.log("Supabase sync successful.");
    } catch (e: any) {
      console.error("Supabase sync failed:", e.message || e);
      if (e.message?.includes('related_videos')) {
          const fallbackRow = mapPostToRow(post, false);
          await supabase.from('posts').upsert(fallbackRow);
      }
    }
  }
};

export const deletePost = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
        await supabase.from('posts').delete().eq('id', id);
    } catch (e) {}
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
      const posts: Post[] = JSON.parse(stored);
      const newPosts = posts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  }
};

const getAgentOverrides = (): Record<string, Partial<Agent>> => {
    try {
        const stored = localStorage.getItem(AGENT_OVERRIDES_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
};

const getCustomAgents = (): Agent[] => {
    try {
        const stored = localStorage.getItem(AGENT_CUSTOM_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

const getAgentExclusions = (): string[] => {
    try {
        const stored = localStorage.getItem(AGENT_EXCLUSIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const getAgents = (): Agent[] => {
    const overrides = getAgentOverrides();
    const custom = getCustomAgents();
    const excluded = getAgentExclusions();
    
    const combined = [
        ...BASE_AGENTS.map(agent => ({ ...agent, ...(overrides[agent.id] || {}) })),
        ...custom
    ];
    
    // Default category to relationship if missing
    return combined
        .map(a => ({ ...a, category: a.category || 'relationship' }))
        .filter(agent => !excluded.includes(agent.id) && agent.category === 'relationship');
};

export const getAstroAgents = (): Agent[] => {
    const overrides = getAgentOverrides();
    const custom = getCustomAgents();
    const excluded = getAgentExclusions();
    
    const combined = [
        ...BASE_ASTRO_AGENTS.map(agent => ({ ...agent, ...(overrides[agent.id] || {}) })),
        ...custom
    ];
    
    return combined
        .map(a => ({ ...a, category: a.category || 'astro' }))
        // Fix: Use 'agent.id' instead of undefined 'a.id' in the filter predicate.
        .filter(agent => !excluded.includes(agent.id) && (agent.category === 'astro' || agent.id.length < 15)); // Heuristic for base astro IDs
};

export const saveAgent = async (agentId: string, updates: Partial<Agent>): Promise<void> => {
    const custom = getCustomAgents();
    const customIndex = custom.findIndex(a => a.id === agentId);
    
    if (customIndex >= 0) {
        custom[customIndex] = { ...custom[customIndex], ...updates };
        localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(custom));
    } else {
        const overrides = getAgentOverrides();
        overrides[agentId] = { ...(overrides[agentId] || {}), ...updates };
        localStorage.setItem(AGENT_OVERRIDES_KEY, JSON.stringify(overrides));
    }
};

export const addCustomAgent = async (agent: Agent): Promise<void> => {
    const custom = getCustomAgents();
    custom.push(agent);
    localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(custom));
};

export const deleteAgent = async (id: string): Promise<void> => {
    const custom = getCustomAgents();
    const newCustom = custom.filter(a => a.id !== id);
    localStorage.setItem(AGENT_CUSTOM_KEY, JSON.stringify(newCustom));
    
    const excluded = getAgentExclusions();
    if (!excluded.includes(id)) {
        excluded.push(id);
        localStorage.setItem(AGENT_EXCLUSIONS_KEY, JSON.stringify(excluded));
    }
};
