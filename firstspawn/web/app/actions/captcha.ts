'use server';

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const REQUEST_TIMEOUT_MS = 4000;

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

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export const verifyHumanityWithWit = async (success: boolean, delta: number): Promise<string> => {
  const prompt = success 
    ? `The user successfully solved a pixel-art screw captcha. They were off by only ${delta.toFixed(1)} degrees. Write a very short, funny, retro-futuristic "Access Granted" message (max 10 words). Tone: Cyberpunk or 8-bit RPG.`
    : `The user failed a pixel-art screw captcha. They were off by ${delta.toFixed(1)} degrees. Write a very short, sarcastic, retro-futuristic "Access Denied" message (max 10 words). Tone: Cyberpunk or 8-bit RPG helper bot.`;

  const fallback = success ? "ACCESS GRANTED" : "ACCESS DENIED";

  // 1. Try Gemini
  const geminiClient = getGeminiClient();
  const openaiClient = getOpenAIClient();

  // If no providers are configured, keep deterministic fallback behavior.
  if (!geminiClient && !openaiClient) return fallback;

  if (geminiClient) {
    try {
      const result = await withTimeout(
        geminiClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        REQUEST_TIMEOUT_MS
      );
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (error) {
      console.warn("Gemini API unavailable for captcha wit:", error);
    }
  }

  // 2. Try OpenAI
  if (openaiClient) {
    try {
      const response = await withTimeout(
        openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 20,
        }),
        REQUEST_TIMEOUT_MS
      );
      const text = response.choices[0]?.message?.content;
      if (text) return text.trim();
    } catch (error) {
      console.warn("OpenAI API unavailable for captcha wit:", error);
    }
  }

  // Final Fallback
  return fallback;
};
