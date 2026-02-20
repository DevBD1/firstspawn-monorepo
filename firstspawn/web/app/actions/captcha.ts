'use server';

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

export const verifyHumanityWithWit = async (success: boolean, delta: number): Promise<string> => {
  const prompt = success 
    ? `The user successfully solved a pixel-art screw captcha. They were off by only ${delta.toFixed(1)} degrees. Write a very short, funny, retro-futuristic "Access Granted" message (max 10 words). Tone: Cyberpunk or 8-bit RPG.`
    : `The user failed a pixel-art screw captcha. They were off by ${delta.toFixed(1)} degrees. Write a very short, sarcastic, retro-futuristic "Access Denied" message (max 10 words). Tone: Cyberpunk or 8-bit RPG helper bot.`;

  const fallback = success ? "ACCESS GRANTED" : "ACCESS DENIED";

  // 1. Try Gemini
  const geminiClient = getGeminiClient();
  if (geminiClient) {
    try {
      const result = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
    }
  }

  // 2. Try OpenAI
  const openaiClient = getOpenAIClient();
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
      });
      const text = response.choices[0]?.message?.content;
      if (text) return text.trim();
    } catch (error) {
      console.error("OpenAI API Error:", error);
    }
  }

  // Final Fallback
  return fallback;
};
