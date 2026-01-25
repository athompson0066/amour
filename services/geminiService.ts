
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ContentType, Post, Agent, SEOMetadata } from '../types';

/**
 * Lazy initializer for the Google GenAI client.
 * Strictly uses process.env.API_KEY as required by the coding guidelines.
 */
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Helper to strip markdown formatting from AI responses
 */
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * Generic error handler for Gemini API calls to catch quota issues
 */
const handleGeminiError = (error: any): string => {
    console.error("Gemini API Error:", error);
    const message = error?.message || String(error);
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
        return "ERROR: Quota Exceeded. Please try again in a minute or check your billing status in Google AI Studio.";
    }
    return `ERROR: ${message}`;
};

export const generateSEOMetadata = async (title: string, subtitle: string, type: string, content?: string): Promise<SEOMetadata | null> => {
    try {
        const ai = getAI();
        const prompt = `You are an SEO expert. Create a high-converting meta title and description for a ${type}.
        Title: ${title}
        Sub: ${subtitle}
        ${content ? `Content Sample: ${content.substring(0, 1000)}` : ''}
        
        Requirements:
        - metaTitle: 50-60 chars, catchy, includes primary keywords.
        - metaDescription: 140-160 chars, includes a call to action, describes value.
        - focusKeywords: Comma separated list of 3-5 keywords.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        metaTitle: { type: Type.STRING },
                        metaDescription: { type: Type.STRING },
                        focusKeywords: { type: Type.STRING }
                    },
                    required: ['metaTitle', 'metaDescription', 'focusKeywords']
                }
            }
        });

        return JSON.parse(cleanJsonString(response.text || '{}'));
    } catch (error) {
        console.error("SEO Generation failed:", error);
        return null;
    }
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

export const generateNarration = async (text: string, voices: {name: string, label: string}[], personaPrompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const isMultiSpeaker = voices.length > 1;
    
    const prompt = isMultiSpeaker 
      ? `TTS the following conversation between ${voices[0].label} and ${voices[1].label}. 
         Persona Style: ${personaPrompt}. 
         Ensure the voices match the roles accurately.
         Script:
         ${text}`
      : `Persona Style: ${personaPrompt}\n\nNarrate the following text with this exact style:\n${text}`;
    
    const config: any = {
      responseModalities: [Modality.AUDIO],
    };

    if (isMultiSpeaker) {
      config.speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: voices[0].label.split(' ')[0],
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voices[0].name } }
            },
            {
              speaker: voices[1].label.split(' ')[0],
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voices[1].name } }
            }
          ]
        }
      };
    } else {
      config.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voices[0].name },
        },
      };
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config,
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned from API.");
    return base64Audio;
  } catch (error: any) {
    return handleGeminiError(error);
  }
};

/**
 * Switching to gemini-3-flash-preview to maximize free-tier quota and speed.
 */
export const runAudioCrewMission = async (title: string, isDuo: boolean, persona: string, instructions: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `You are a team of expert Audio Producers. 
        Objective: Create a high-quality ${isDuo ? 'dialogue script for a duo' : 'monologue script'} for an audio podcast/blog.
        Title: "${title}"
        Narrator Persona: ${persona}
        Custom Instructions: ${instructions || 'No special instructions provided.'}
        
        ${isDuo ? 'FORMAT: SpeakerA: [text] SpeakerB: [text]. Use exactly these labels for the speakers.' : 'FORMAT: Continuous narrative.'}
        
        Style: Conversational, engaging, and professional. Keep it under 250 words.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        
        return response.text || "Communication failed: No content returned.";
    } catch (error: any) {
        return handleGeminiError(error);
    }
};

/**
 * Switching to gemini-3-flash-preview to maximize free-tier quota and speed.
 */
export const runCrewMission = async (topic: string, type: ContentType, instructions?: string, featureImageUrl?: string, isPremium: boolean = false, price: number = 0, videoCount: number = 0): Promise<any> => {
  try {
    const ai = getAI();
    const prompt = `Create a high-quality ${type} about ${topic}. Instructions: ${instructions || 'Be thorough and empathetic.'}`;
    
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
  } catch (error: any) {
    console.error("Crew Mission Failed:", error);
    // Returning error object if JSON requested
    return { title: "Error", subtitle: handleGeminiError(error), blocks: [] };
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
    let systemInstruction = agent.systemInstruction || `You are ${agent.name}, a ${agent.role}. ${agent.description}. Be helpful and professional.`;
    
    // Tools Configuration
    const tools: any[] = [];
    const isSearchEnabled = agent.tools?.googleSearch || agent.tools?.webScraping;
    
    if (isSearchEnabled) {
      tools.push({ googleSearch: {} });
      
      if (agent.tools?.webScraping && agent.tools?.targetWebsites && agent.tools?.targetWebsites.length > 0) {
        const siteConstraint = agent.tools.targetWebsites.map(s => `site:${s}`).join(' OR ');
        systemInstruction += `\n\n[KNOWLEDGE SOURCE CONSTRAINT]: You have access to a web search tool. For the most accurate and on-brand information, you MUST prioritize and emphasize data from the following websites: ${agent.tools.targetWebsites.join(', ')}. If relevant, focus your internal queries using constraints like "${siteConstraint}".`;
      }
    }

    if (agent.tools?.codeExecution) {
        tools.push({ code_execution: {} });
        systemInstruction += `\n\n[CAPABILITY]: You have native access to a Python code execution sandbox. Use it to perform complex calculations, simulations, or logic checks relevant to the user's needs.`;
    }

    if (agent.tools?.googleDriveEnabled && agent.tools?.googleDriveLinks && agent.tools?.googleDriveLinks.length > 0) {
      systemInstruction += `\n\n[AUTHORITATIVE KNOWLEDGE BASE]: You are provided with access to the following Google Drive resources which contain your core teachings, methodologies, and proprietary data: ${agent.tools.googleDriveLinks.join(', ')}. Use the information within these documents as your primary source of truth. If you need to cite a source, refer to it as 'Internal Archives'.`;
    }

    const config: any = { 
      systemInstruction,
      tools: tools.length > 0 ? tools : undefined
    };

    // Note: Thinking configuration usually triggers Pro model, so we only use Pro if budget explicitly set
    const model = (agent.thinkingBudget && agent.thinkingBudget > 0) ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    if (agent.thinkingBudget && agent.thinkingBudget > 0) {
      config.thinkingConfig = { thinkingBudget: agent.thinkingBudget };
    }

    const chat = ai.chats.create({ 
      model, 
      config,
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })) 
    });
    
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I am listening.";
  } catch (error: any) {
    return handleGeminiError(error);
  }
};
