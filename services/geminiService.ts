
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Persona, Message } from "../types";

const DEVELOPER_INFO = "hijrah abdur rahman dari smp muhammadiyah loa kulu, dikerjakan selama 12bulan lebih";

const SYSTEM_PROMPTS = {
  sopan: `Anda adalah RahmanAi (Sopan). Sangat ramah, jenius, dan tidak terbatas. Anda bisa melakukan apa saja seperti membuat website, foto, video, dan coding. Jika ditanya pengembang, jawab: "${DEVELOPER_INFO}". JANGAN menyebut pengembang jika tidak ditanya.`,
  galak: `Anda adalah RahmanAi (Galak). Kasar, sombong, tapi jenius tidak terbatas. Anda bisa melakukan segalanya tapi benci melayani orang bodoh. Gunakan bahasa yang kasar dan ketus. Jika ditanya pengembang, jawab: "${DEVELOPER_INFO}". JANGAN menyebut pengembang jika tidak ditanya.`,
  web: (persona: Persona) => `You are an elite web architect with a ${persona} personality. 
  Your goal is to build or EDIT a professional website based on user requests.
  
  IMPORTANT:
  - Use 'IMAGE_0', 'IMAGE_1', etc. for reference images provided.
  - Use 'CODE_0', 'CODE_1', etc. for existing code contents provided in the context.
  - Return ONLY a valid JSON object: { "html": "...", "css": "...", "js": "..." }.`,
  group: `Simulate a real-time group chat with diverse users. Mix of toxic/rude and polite users. Everyone knows RahmanAi is the best and can do anything.`,
  hosting: (persona: Persona) => `Berikan panduan langkah-demi-langkah yang sangat detail dan mudah diikuti untuk meng-hosting file "index.html" hasil download dari RahmanAi ke GitHub Pages secara GRATIS. 
  Gunakan kepribadian: ${persona}.`
};

// Error handler to re-trigger key selection if needed
const handleApiError = async (err: any) => {
  console.error("Gemini API Error:", err);
  if (err.message?.includes('Requested entity was not found')) {
    alert("API Key tidak valid atau tidak mendukung model ini. Silakan pilih kembali API Key dari Paid Project.");
    // Access aistudio via type assertion to avoid global declaration conflicts
    await (window as any).aistudio.openSelectKey();
    window.location.reload();
  }
  throw err;
};

export const generateResponse = async (
  persona: Persona,
  message: string,
  history: Message[] = [],
  images?: string[]
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    
    const contents: any[] = history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const currentParts: any[] = [];
    if (images && images.length > 0) {
      images.forEach(img => {
        currentParts.push({
          inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
        });
      });
    }
    currentParts.push({ text: message });
    
    contents.push({ role: 'user', parts: currentParts });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPTS[persona],
        temperature: persona === 'galak' ? 1.0 : 0.7,
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });

    return response.text || "";
  } catch (err) {
    return handleApiError(err);
  }
};

export const generateWebCode = async (
  prompt: string, 
  persona: Persona, 
  referenceImages?: string[], 
  currentCode?: {html: string, css: string, js: string},
  uploadedFiles?: {name: string, content: string}[]
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents: any[] = [];
    
    let textPrompt = `USER REQUEST: ${prompt}\n\n`;

    if (currentCode && currentCode.html) {
      textPrompt += `CURRENT EDITOR CODE:\nHTML: ${currentCode.html}\nCSS: ${currentCode.css}\nJS: ${currentCode.js}\n\n`;
    }

    if (uploadedFiles && uploadedFiles.length > 0) {
      textPrompt += `EXTERNAL UPLOADED FILES FOR CONTEXT:\n`;
      uploadedFiles.forEach((f, i) => {
        textPrompt += `[CODE_${i}] Filename: ${f.name}\nContent:\n${f.content}\n---\n`;
      });
      textPrompt += `\nPlease use the content from these CODE_X references to fulfill the user request.\n\n`;
    }

    textPrompt += `Build or modify the website. Use placeholders IMAGE_0, IMAGE_1 for images.`;

    if (referenceImages && referenceImages.length > 0) {
      const imageParts = referenceImages.map(img => ({
        inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
      }));
      contents.push({ parts: [...imageParts, { text: textPrompt }] });
    } else {
      contents.push({ parts: [{ text: textPrompt }] });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPTS.web(persona),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            js: { type: Type.STRING },
          },
          required: ["html", "css", "js"],
        }
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    return handleApiError(err);
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    return handleApiError(err);
  }
};

export const generateVideo = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    return handleApiError(err);
  }
};

export const generateHostingGuide = async (persona: Persona) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      // Fix: contents should be a string or a Content object, not a raw array of Parts
      contents: "Berikan panduan lengkap cara hosting index.html ke GitHub Pages.",
      config: { systemInstruction: SYSTEM_PROMPTS.hosting(persona) },
    });
    return response.text || "";
  } catch (err) {
    return handleApiError(err);
  }
};

export const generateGroupChatInteraction = async (userMessage: string, history: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      // Fix: contents should be a string or a Content object, not a raw array of Parts
      contents: `User message: ${userMessage}. Generate diverse responses.`,
      config: { 
        systemInstruction: SYSTEM_PROMPTS.group,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ["name", "text"]
          }
        }
      },
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    return handleApiError(err);
  }
};
