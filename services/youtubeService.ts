
import { config } from '../config';
import { VideoItem } from '../types';

// High-quality, guaranteed embeddable videos to use when API key is missing or fails
const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: 'cN0q_6215rY', 
    title: 'The difference between healthy and unhealthy love | Katie Hood',
    description: 'In a talk about understanding the difference between healthy and unhealthy love, Katie Hood shares the five markers of unhealthy love.',
    thumbnail: 'https://img.youtube.com/vi/cN0q_6215rY/maxresdefault.jpg',
    channelTitle: 'TED',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'sa0RUmGTCYY', 
    title: 'Why We Pick The Partners We Do',
    description: 'We don\'t pick partners entirely accidentally. We are looking for something very specific, even if we don\'t quite know what it is.',
    thumbnail: 'https://img.youtube.com/vi/sa0RUmGTCYY/maxresdefault.jpg',
    channelTitle: 'The School of Life',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'hT_nvWreIhg', 
    title: 'Counting Stars - Music Video', 
    description: 'A classic music video to test playback capabilities.',
    thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/maxresdefault.jpg',
    channelTitle: 'OneRepublic',
    publishedAt: new Date().toISOString()
  }
];

export const fetchVideos = async (category: string): Promise<VideoItem[]> => {
  // Prioritize the key entered in the Admin Settings (config)
  const apiKey = config.youtube.apiKey;
  
  if (!apiKey) {
      console.warn("YouTube API Key missing in Settings. Using fallbacks.");
      return FALLBACK_VIDEOS;
  }

  const query = `${category} relationship advice`;
  // We use videoEmbeddable=true to ensure we only get videos that will play on your site
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=moderate&q=${encodeURIComponent(query)}&maxResults=12&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.warn(`YouTube API Error: ${data.error?.message || response.statusText}. Check your API key in Admin Settings.`);
        return FALLBACK_VIDEOS;
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        return FALLBACK_VIDEOS;
    }

    return data.items
      .filter((item: any) => item.id && item.id.videoId)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
    }));

  } catch (error: any) {
    console.error("Failed to fetch videos from YouTube:", error);
    return FALLBACK_VIDEOS;
  }
};
