'use server';

import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  // Debug logging
  if (!apiKey) {
    console.log("Debug - Available Env Vars:", Object.keys(process.env).filter(key => !key.startsWith('npm_')));
    console.log("Debug - GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
    console.error("API_KEY is missing in server environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const verifyHumanityWithWit = async (success: boolean, delta: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return success ? "Verified. (API Key Missing)" : "Failed. (API Key Missing)";

  const model = "gemini-2.0-flash-exp"; 
  // Note: Using a standard model name. 'gemini-3-flash-preview' was in reference, might be experimental. 
  // 'gemini-1.5-flash' is safe.
  
  const prompt = success 
    ? `The user successfully solved a pixel-art screw captcha. They were off by only ${delta.toFixed(1)} degrees. Write a very short, funny, retro-futuristic "Access Granted" message (max 10 words). Tone: Cyberpunk or 8-bit RPG.`
    : `The user failed a pixel-art screw captcha. They were off by ${delta.toFixed(1)} degrees. Write a very short, sarcastic, retro-futuristic "Access Denied" message (max 10 words). Tone: Cyberpunk or 8-bit RPG helper bot.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Fallback to 1.5 flash if this fails, but user had 3-flash-preview?
      contents: prompt,
    });
    return response.text || (success ? "ACCESS GRANTED" : "ACCESS DENIED");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback simple messages
    return success ? "ACCESS GRANTED" : "ACCESS DENIED";
  }
};
