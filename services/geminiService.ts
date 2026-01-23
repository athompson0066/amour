import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, Post, Agent } from '../types';

/**
 * Lazy initializer for the Google GenAI client.
 * Strictly uses process.env.API_KEY as required by the coding guidelines.
 */
const getAI = () => {
  // Always use process.env.API_KEY string directly.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Helper to strip markdown formatting from AI responses
 */
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateSoulmateSketch = async (data: any): Promise<string | null> => {
  try {
    const ai = getAI();
    const entropy = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const seed = Math.floor(Math.random() * 2147483647);

    const faceShapes = ["Diamond", "Square", "Heart", "Oval", "Oblong", "Round", "Pear-shaped"];
    const noseTypes = ["Aquiline", "Roman", "Greek", "Button", "Nubian", "Snub", "Hawk"];
    const chosenFace = faceShapes[seed % faceShapes.length];
    const chosenNose = noseTypes[(seed >> 2) % noseTypes.length];

    const systemPrompt = `
      Role: You are "Aethel," a master clairvoyant sketch artist.
      Mandate: Manifest a profoundly UNIQUE and CHARACTER-FILLED human portrait.
      
      STRICT NO-SAME-FACE POLICY:
      - Do NOT use a generic "attractive" template.
      - Create a face with specific, non-standard geometry: ${chosenFace} face shape, ${chosenNose} nose profile.
      - Incorporate distinctive anatomical markers: Varying eye tilts, unique jawline widths, and specific eyebrow arches.
      - Authenticity: Include subtle "human" imperfections (slight asymmetry, character lines, unique skin textures).

      Artistic Style:
      - Medium: Deep charcoal and raw graphite on heavy archival paper.
      - Technique: Visible cross-hatching, smudged shadows, and raw, energetic pencil strokes.
      - Lighting: Intense side-lighting (Chiaroscuro) to carve out unique bone structures.
      - No Text: No signatures, borders, or watermarks.

      Soul Profile for this channeling (ID: ${entropy}):
      - Gender/Age: ${data.genderPreference} around ${data.ageRange}.
      - Ethnicity: ${data.ethnicity}.
      - Character Quality: ${data.keyQuality}. 
      - Elemental Nature: ${data.element} (${data.element === 'Fire' ? 'sharp/intense' : 'softer/fluid'} features).
      - Complementary Match: Since the user fears ${data.fear}, draw a partner who looks incredibly grounded, protective, and emotionally solid.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: systemPrompt },
          { text: `Aethel, the karmic seed is ${entropy}. Draw the one-of-a-kind face of the soulmate for ${data.firstName} now. Make it a masterpiece of unique human character.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        },
        seed: seed
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Soulmate Sketch Generation Failed:", error);
    return null;
  }
};

export const runCrewMission = async (topic: string, type: ContentType, instructions?: string, featureImageUrl?: string, isPremium: boolean = false, price: number = 0, videoCount: number = 0): Promise<any> => {
  try {
    const ai = getAI();
    const prompt = `Create a high-quality ${type} about ${topic}. Instructions: ${instructions || 'Be thorough and empathetic.'}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            coverImage: { type: Type.STRING },
            youtubeSearchQueries: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 search queries to find related YouTube videos."
            },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['header', 'text', 'quote', 'image', 'cta'] },
                  content: { type: Type.STRING },
                  meta: { 
                    type: Type.OBJECT,
                    properties: {
                      level: { type: Type.STRING, enum: ['h2', 'h3'] }
                    }
                  }
                },
                required: ['type', 'content']
              }
            }
          },
          required: ['title', 'subtitle', 'blocks']
        }
      }
    });

    return JSON.parse(cleanJsonString(response.text || '{}'));
  } catch (error) {
    console.error("Crew Mission Failed:", error);
    throw error;
  }
};

export const generateBlogOutline = async (topic: string): Promise<string> => {
  if (!topic) return "Please provide a topic.";
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a structured blog post outline for a relationship advice article about: "${topic}".`,
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating outline.";
  }
};

export const enhanceContent = async (text: string): Promise<string> => {
  if (!text) return "";
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite the following text to be more engaging and professional: "${text}"`
    });
    return response.text || text;
  } catch (error) {
      return text;
  }
}

export const generatePricingStrategy = async (items: (Post | Agent)[]): Promise<any> => {
  try {
    const ai = getAI();
    const prompt = `Return a JSON array of pricing proposals for these items: ${JSON.stringify(items)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              proposedPrice: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ['id', 'proposedPrice', 'reasoning']
          }
        }
      }
    });
    return JSON.parse(cleanJsonString(response.text || '[]'));
  } catch (error) {
    return [];
  }
};

export const generateCourseStructure = async (topic: string, audience: string, description: string): Promise<any> => {
  try {
    const ai = getAI();
    const prompt = `Design a course about ${topic} for ${audience}. Description: ${description}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            price: { type: Type.NUMBER },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['header', 'text', 'quote', 'image', 'cta'] },
                  content: { type: Type.STRING },
                  meta: { type: Type.OBJECT }
                },
                required: ['type', 'content']
              }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJsonString(response.text || '{}'));
  } catch (error) {
    return null;
  }
};

export const getAgentChatResponse = async (agent: Agent, userMessage: string, history: any[]): Promise<string> => {
  try {
    const ai = getAI();
    const systemInstruction = agent.systemInstruction || `You are ${agent.name}, a ${agent.role}. ${agent.description}. Be helpful and professional.`;
    
    const chat = ai.chats.create({ 
      model: 'gemini-3-flash-preview', 
      config: { systemInstruction }, 
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })) 
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I am listening.";
  } catch (error) {
    return "Connection error.";
  }
};