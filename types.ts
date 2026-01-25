
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
  | 'sketch'
  | 'website';

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
  altText?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'header' | 'quote' | 'cta' | 'agent' | 'video' | 'quiz' | 'embed' | 'pdf' | 'audio';
  content: string;
  meta?: {
    url?: string;
    caption?: string;
    level?: 'h2' | 'h3';
    agentId?: string; 
    videoId?: string; 
    questions?: QuizQuestion[]; 
    html?: string; 
    fileName?: string; 
    audioTitle?: string;
    voiceName?: string;
    bgMusicTrack?: string;
    bgMusicVolume?: number;
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
  readTime: string; 
  isPremium: boolean;
  price?: number; 
  payhipProductUrl?: string; 
  unlockPassword?: string; 
  tags: string[];
  blocks: ContentBlock[];
  relatedVideos?: VideoItem[]; 
  seo?: SEOMetadata;
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
  category: 'relationship' | 'astro'; 
  avatar: string;
  description: string;
  systemInstruction?: string; 
  embedCode?: string; 
  tokenCost: number; // Replaced price string with token numeric cost
  price?: string; // For display/Payhip
  priceValue?: number; // For numeric pricing logic
  payhipProductUrl?: string; 
  unlockPassword?: string; 
  isOnline: boolean;
  expertise: string[];
  tools?: AgentTools;
  thinkingBudget?: number; 
  seo?: SEOMetadata;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tokens: number; // Added token balance
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
