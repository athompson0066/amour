
import { GoogleGenAI, Type } from "@google/genai";
import { config } from '../config';
import { ContentType } from '../types';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const generateBlogOutline = async (topic: string): Promise<string> => {
  if (!topic) return "Please provide a topic.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a structured blog post outline for a relationship advice article about: "${topic}". 
      The tone should be empathetic, expert, and encouraging. 
      Return the result as a simple list of headers and brief descriptions of what to write in each section.`,
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating outline. Please check your API key.";
  }
};

export const enhanceContent = async (text: string): Promise<string> => {
  if (!text) return "";
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite the following text to be more engaging, warm, and professional, suitable for a relationship advice blog: "${text}"`
    });
    return response.text || text;
  } catch (error) {
      console.error("Gemini API Error", error);
      return text;
  }
}

/**
 * Orchestrates a "Crew" of agents to generate a complete piece of high-quality content.
 */
export const runCrewMission = async (
  topic: string, 
  type: ContentType, 
  instructions?: string, 
  featureImageUrl?: string,
  isPremium: boolean = false,
  price: number = 0,
  videoCount: number = 0
): Promise<any> => {
  if (!topic) return null;

  try {
    const prompt = `
      ORCHESTRATION MISSION: Use a Crew-AI style workflow to create a high-quality ${type.toUpperCase()} about "${topic}".
      
      STEPS TAKEN BY THE CREW:
      1. THE STRATEGIST: Research the psychology, trending nuances, and deep emotional stakes of "${topic}".
      2. THE WORDSMITH: Use the Strategist's data to write compelling content tailored for the format of a ${type}.
      3. THE EDITOR: Polish for flow, formatting, and impact.
      
      ${instructions ? `USER SPECIFIC INSTRUCTIONS (PRIORITY): "${instructions}"` : ''}
      
      COVER IMAGE INSTRUCTIONS:
      ${featureImageUrl ? `STRICT: Use this exact URL for coverImage: "${featureImageUrl}"` : `CRITICAL: Generate a realistic, high-quality Unsplash image URL that perfectly matches the topic "${topic}". The URL must follow the format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=1200. Do not use generic placeholders.`}

      VIDEO ENRICHMENT:
      ${videoCount > 0 ? `Include an array called "youtubeSearchQueries" with ${videoCount} specific, highly relevant YouTube search strings that would find the best video advice for this topic.` : ''}

      MONETIZATION SETTINGS (STRICT REQUIREMENT):
      - Set isPremium to: ${isPremium}
      - Set price to: ${price}

      SPECIFIC INSTRUCTIONS FOR FORMAT:
      - If 'newsletter': Make it punchy, personal, and conversational.
      - If 'course' or 'tutorial': Provide structured modules or clear sequential steps.
      - If 'ebook': Provide a comprehensive, long-form structure with a foreword.
      - If 'guide': Focus on "How-To" and "Actionable Steps".
      - If 'podcast': Write it as a detailed script/outline with host notes.
      - If 'listicle': Ensure there are clearly numbered points.

      OUTPUT FORMAT:
      You must return a valid JSON object matching the app's Post structure.
      Include a title, subtitle, coverImage, readTime, and blocks.
      
      CONTENT GUIDELINES:
      - Use headers like "### Key Concept", "### Action Steps", and "### Reflection" to trigger UI icons.

      JSON SCHEMA:
      {
        "id": "generate_a_unique_string_id",
        "title": "String",
        "subtitle": "String",
        "type": "${type}",
        "coverImage": "A valid Unsplash URL string",
        "author": {
          "id": "amour_staff",
          "name": "Amour Staff",
          "avatar": "https://images.unsplash.com/photo-1675426513962-1db7e4c707c3?auto=format&fit=crop&q=80&w=150&h=150",
          "bio": "The official content creation team at Amour, leveraging collaborative intelligence."
        },
        "isPremium": ${isPremium},
        "price": ${price},
        "readTime": "String",
        "tags": ["Array of Strings"],
        "youtubeSearchQueries": ["Array of search strings"],
        "blocks": [
          { "id": "uuid_style_string", "type": "header", "content": "Text", "meta": { "level": "h2" } },
          { "id": "uuid_style_string", "type": "text", "content": "Text" },
          { "id": "uuid_style_string", "type": "quote", "content": "Text" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Crew Mission Failed:", error);
    return null;
  }
};

export const generateCourseStructure = async (topic: string, audience: string, description: string): Promise<any> => {
  if (!topic) return null;

  try {
    const safeDescription = description ? description.substring(0, 500) : "";

    const prompt = `
      You are an elite course creator for a premium relationship advice platform. 
      Design a comprehensive, high-value 4-week course about "${topic}".
      Target Audience: ${audience || 'General'}.
      Context: ${safeDescription}.

      Output a VALID JSON object.
      
      JSON Structure:
      {
        "title": "Catchy Title",
        "subtitle": "Compelling value proposition (1-2 sentences)",
        "price": 49.99,
        "readTime": "4 Week Course",
        "tags": ["Tag1", "Tag2"],
        "blocks": [ ... ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        temperature: 0.7, 
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error in generateCourseStructure:", error);
    return null;
  }
};

export const getAgentChatResponse = async (
  agent: { name: string; role: string; description: string }, 
  userMessage: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  try {
    const historyParts = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const systemInstruction = `
      You are ${agent.name}, a ${agent.role}. 
      Your profile description is: "${agent.description}".
      
      Instructions:
      1. Stay strictly in character. 
      2. Offer empathetic, actionable relationship advice.
      3. Keep responses concise (under 100 words) and conversational.
      4. Do not act like a generic AI assistant; have a personality fitting your role.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: historyParts
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm listening...";
  } catch (error) {
    console.error("Agent Chat Error:", error);
    return "I apologize, I'm having trouble connecting right now. Can you repeat that?";
  }
};
