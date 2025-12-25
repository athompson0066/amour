
import { Post, Author, Agent } from '../types';
import { getSupabase } from './supabaseClient';

const STORAGE_KEY = 'amour_directory_data';

const DEFAULT_AUTHOR: Author = {
  id: 'a1',
  name: 'Dr. Elena Rose',
  avatar: 'https://picsum.photos/seed/elena/150/150',
  bio: 'Relationship Psychologist & Love Coach',
};

// Seed data for fresh local storage
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
  },
  {
    id: '1',
    title: 'The Art of Vulnerability',
    subtitle: 'Why opening up is the secret to lasting connection.',
    type: 'article',
    coverImage: 'https://picsum.photos/seed/love1/800/400',
    author: DEFAULT_AUTHOR,
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readTime: '6 min read',
    isPremium: false,
    tags: ['Intimacy', 'Communication'],
    blocks: [
      { id: 'b1', type: 'header', content: 'Why We Hide', meta: { level: 'h2' } },
      { id: 'b2', type: 'text', content: 'In a world that values strength, vulnerability is often mistaken for weakness. However, in the context of romantic relationships, it is the ultimate superpower.' },
      { id: 'b3', type: 'quote', content: 'To love at all is to be vulnerable. Love anything and your heart will be wrung and possibly broken.' },
      { id: 'b4', type: 'text', content: 'When we share our fears, we invite our partners to protect us. This creates a bond that surface-level conversations can never achieve.' },
    ]
  }
];

const mapRowToPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  type: row.type,
  coverImage: row.cover_image,
  author: row.author || DEFAULT_AUTHOR,
  publishedAt: row.published_at,
  readTime: row.read_time,
  isPremium: row.is_premium,
  price: row.price,
  tags: row.tags || [],
  blocks: row.blocks || [],
  relatedVideos: row.related_videos || []
});

const mapPostToRow = (post: Post, includeVideos: boolean = true) => {
  const row: any = {
    id: post.id || `post_${Date.now()}`,
    title: post.title,
    subtitle: post.subtitle,
    type: post.type,
    cover_image: post.coverImage,
    author: post.author || DEFAULT_AUTHOR,
    published_at: post.publishedAt || new Date().toISOString(),
    read_time: post.readTime,
    is_premium: post.isPremium,
    price: post.price || 0,
    tags: post.tags || [],
    blocks: post.blocks || []
  };
  
  if (includeVideos) {
    row.related_videos = post.relatedVideos || [];
  }
  
  return row;
};

export const getPosts = async (): Promise<Post[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data.map(mapRowToPost);
    } catch (e) {
      console.error("Supabase fetch failed, falling back to Local Storage:", e);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const getAgents = (): Agent[] => [
  { id: 'ag1', name: 'Sarah Bennett', role: 'Breakup Recovery Coach', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150', description: 'Providing immediate emotional triage and actionable steps to heal your heart and reclaim your identity after a split.', price: '$2.99/min', priceValue: 2.99, isOnline: true, expertise: ['Heartbreak', 'No Contact', 'Healing'] },
  { id: 'ag2', name: 'Dr. Marcus Thorne', role: 'Conflict Mediator', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150', description: 'De-escalating explosive arguments and translating partner complaints into actionable needs for immediate peace.', price: '$3.50/min', priceValue: 3.50, isOnline: true, expertise: ['Arguments', 'Communication', 'Anger'] },
  { id: 'ag3', name: 'Chloe Vance', role: 'Attachment Specialist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150', description: 'Helping you navigate anxious and avoidant dynamics to build a "Secure" foundation for lasting partnership.', price: '$3.25/min', priceValue: 3.25, isOnline: true, expertise: ['Attachment Theory', 'Anxiety', 'Security'] },
  { id: 'ag4', name: 'Julian Vance', role: 'Marriage Architect', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', description: 'Strengthening the structural integrity of long-term commitments and navigating the "seven-year itch" with grace.', price: '$4.00/min', priceValue: 4.00, isOnline: true, expertise: ['Marriage', 'Commitment', 'Longevity'] },
  { id: 'ag5', name: 'Maya Rivers', role: 'Self-Love & Boundaries Coach', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150', description: 'Teaching you how to set healthy limits and cultivate self-respect as the bedrock for all your relationships.', price: '$3.00/min', priceValue: 3.00, isOnline: true, expertise: ['Boundaries', 'Self-Esteem', 'Codependency'] },
  { id: 'ag6', name: 'Dr. Aris Thorne', role: 'LGBTQ+ Dynamics Specialist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150', description: 'Expert guidance on navigating the unique nuances, communication styles, and community dynamics of queer love.', price: '$3.75/min', priceValue: 3.75, isOnline: true, expertise: ['Queer Love', 'Identity', 'Community'] },
  { id: 'ag7', name: 'Sienna Gold', role: 'Modern Dating Strategist', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=150&h=150', description: 'Optimizing your digital presence and helping you navigate the "swiping" culture to find high-quality connections.', price: '$3.50/min', priceValue: 3.50, isOnline: true, expertise: ['Dating Apps', 'First Dates', 'Profile Tuning'] },
  { id: 'ag8', name: 'David Chen', role: 'Intimacy & Desire Expert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', description: 'Reigniting the physical and emotional spark in relationships that have become "roommate-ified" or stagnant.', price: '$4.25/min', priceValue: 4.25, isOnline: true, expertise: ['Intimacy', 'Passion', 'Desire'] },
  { id: 'ag9', name: 'Amara West', role: 'Infidelity Recovery Expert', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150&h=150', description: 'Healing the trauma of betrayal and providing a roadmap for rebuilding trust or parting ways with dignity.', price: '$4.50/min', priceValue: 4.50, isOnline: true, expertise: ['Trust', 'Betrayal', 'Healing'] }
];

export const getAstroAgents = (): Agent[] => [
    { id: 'astro-aries', name: 'Leo Blaze', role: 'Aries Passion Sparker', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', description: 'Igniting the fire of new beginnings and bold romantic pursuits.', price: '$3.99/min', priceValue: 3.99, isOnline: true, expertise: ['Passion', 'New Love', 'Confidence'] },
    { id: 'astro-taurus', name: 'Elena Earth', role: 'Taurus Stability Anchor', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150', description: 'Grounded wisdom for building a love that lasts through sensory connection and loyalty.', price: '$3.50/min', priceValue: 3.50, isOnline: true, expertise: ['Stability', 'Loyalty', 'Sensuality'] },
    { id: 'astro-gemini', name: 'Jax Twin', role: 'Gemini Dialogue Weaver', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150', description: 'Mastering the art of dual perspective and stimulating conversation in love.', price: '$3.25/min', priceValue: 3.25, isOnline: true, expertise: ['Communication', 'Flirting', 'Variety'] },
    { id: 'astro-cancer', name: 'Luna Moon', role: 'Cancer Emotional Nurturer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150', description: 'Protecting the heart and creating a sanctuary of deep emotional safety.', price: '$3.75/min', priceValue: 3.75, isOnline: true, expertise: ['Nurturing', 'Security', 'Home Life'] },
    { id: 'astro-leo', name: 'Apollo Sun', role: 'Leo Heart Radiator', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150', description: 'Celebrating grand romance and the courage to love out loud.', price: '$4.50/min', priceValue: 4.50, isOnline: true, expertise: ['Romance', 'Generosity', 'Drama'] },
    { id: 'astro-virgo', name: 'Vera Pure', role: 'Virgo Devotion Mechanic', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150&h=150', description: 'Refining the details of service and acts of devotion for a healthy bond.', price: '$3.25/min', priceValue: 3.25, isOnline: true, expertise: ['Devotion', 'Improvement', 'Service'] },
    { id: 'astro-libra', name: 'Harmony Just', role: 'Libra Harmony Keeper', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150', description: 'Balancing the scales of partnership through grace and aesthetic connection.', price: '$3.99/min', priceValue: 3.99, isOnline: true, expertise: ['Balance', 'Aesthetics', 'Partnership'] },
    { id: 'astro-scorpio', name: 'Linda Valdez', role: 'Scorpio Love Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150', description: 'Expert in the intense, transformative waters of Scorpio.', price: '$4.99/min', priceValue: 4.99, isOnline: true, expertise: ['Intimacy', 'Trust', 'Transformation'] },
    { id: 'astro-sagittarius', name: 'Archer Free', role: 'Sagittarius Adventure Catalyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', description: 'Expanding horizons through shared travel, philosophy, and untethered love.', price: '$3.50/min', priceValue: 3.50, isOnline: true, expertise: ['Freedom', 'Exploration', 'Honesty'] },
    { id: 'astro-capricorn', name: 'Saturn Stone', role: 'Capricorn Legacy Builder', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', description: 'Building romantic legacies through discipline, ambition, and time-tested love.', price: '$4.25/min', priceValue: 4.25, isOnline: true, expertise: ['Commitment', 'Legacy', 'Ambition'] },
    { id: 'astro-aquarius', name: 'Nova Flow', role: 'Aquarius Freedom Muse', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=150&h=150', description: 'Revolutionizing love through individuality, friendship, and humanitarian vision.', price: '$3.75/min', priceValue: 3.75, isOnline: true, expertise: ['Individuality', 'Friendship', 'Vision'] },
    { id: 'astro-pisces', name: 'Marina Soul', role: 'Pisces Soul Merger', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150', description: 'Navigating the mystical realms of unconditional love and spiritual union.', price: '$3.99/min', priceValue: 3.99, isOnline: true, expertise: ['Spirituality', 'Empathy', 'Dreams'] }
];

export const savePost = async (post: Post): Promise<void> => {
  const supabase = getSupabase();
  
  if (supabase) {
    try {
      const row = mapPostToRow(post, true);
      const { error } = await supabase.from('posts').upsert(row);
      
      if (error) {
        // Handle missing column error specifically
        if (error.message.includes('related_videos')) {
          console.warn("MIGRATION REQUIRED: The 'related_videos' column is missing in your Supabase 'posts' table.");
          console.warn("RUN THIS SQL IN SUPABASE: ALTER TABLE posts ADD COLUMN related_videos JSONB DEFAULT '[]';");
          console.log("Retrying save without 'related_videos' column...");
          
          const fallbackRow = mapPostToRow(post, false);
          const { error: retryError } = await supabase.from('posts').upsert(fallbackRow);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      console.log("Article published successfully to Supabase.");
    } catch (e: any) {
      console.error("Supabase integration error, falling back to Local Storage:", e.message || e);
    }
  }

  // Always sync to Local Storage to ensure UI responsiveness
  let currentLocalPosts: Post[] = [];
  const stored = localStorage.getItem(STORAGE_KEY);
  currentLocalPosts = stored ? JSON.parse(stored) : SEED_DATA;
  
  const existingIndex = currentLocalPosts.findIndex(p => p.id === post.id);
  if (existingIndex >= 0) {
    currentLocalPosts[existingIndex] = post;
  } else {
    currentLocalPosts.unshift(post);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocalPosts));
  console.log(`Article "${post.title}" saved locally.`);
};

export const deletePost = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.error("Supabase delete failed:", e);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
      const posts: Post[] = JSON.parse(stored);
      const newPosts = posts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  }
};
