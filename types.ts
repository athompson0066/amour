
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

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  systemInstruction?: string; // Custom AI behavior instructions
  embedCode?: string; // Optional custom HTML/JS embed snippet
  price: string; // Display string e.g. "$2.99/min"
  priceValue?: number; // Numerical value for payment processing
  payhipProductUrl?: string; // Payhip support for experts
  isOnline: boolean;
  expertise: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number; // For agent chats
  purchasedContentIds: string[]; // List of IDs of purchased courses/articles/agents
  isSubscriber: boolean; // Amour+ status
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
