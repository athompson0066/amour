
export type ContentType = 
  | 'article' 
  | 'course' 
  | 'podcast' 
  | 'listicle' 
  | 'app' 
  | 'newsletter' 
  | 'guide' 
  | 'tutorial' 
  | 'ebook'
  | 'sketch';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'header' | 'quote' | 'cta' | 'agent' | 'video';
  content: string;
  meta?: {
    url?: string;
    caption?: string;
    level?: 'h2' | 'h3';
    agentId?: string; // Reference to an expert ID
    videoId?: string; // YouTube video ID for video blocks
  };
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  type: ContentType;
  coverImage: string;
  author: Author;
  publishedAt: string;
  readTime: string; // e.g., "5 min read" or "2h Course"
  isPremium: boolean;
  price?: number; // if course or premium article
  payhipProductUrl?: string; // Payhip direct link or product code
  tags: string[];
  blocks: ContentBlock[];
  relatedVideos?: VideoItem[]; // Added for YouTube integration
}

export interface AgentTools {
  googleSearch?: boolean;
  vision?: boolean;
  codeExecution?: boolean;
  webScraping?: boolean; 
  targetWebsites?: string[];
  googleDriveEnabled?: boolean; 
  googleDriveLinks?: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  category: 'relationship' | 'astro'; // New: Determines which council the agent belongs to
  avatar: string;
  description: string;
  systemInstruction?: string; 
  embedCode?: string; 
  price: string; 
  priceValue?: number; 
  payhipProductUrl?: string; 
  isOnline: boolean;
  expertise: string[];
  tools?: AgentTools;
  thinkingBudget?: number; 
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number; 
  purchasedContentIds: string[]; 
  isSubscriber: boolean; 
}

export interface FilterState {
  search: string;
  type: ContentType | 'all';
  onlyPremium: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}
