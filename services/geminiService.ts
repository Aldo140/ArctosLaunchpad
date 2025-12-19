/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the Studio Assistant for BaseLayer Studio (formerly Lumina).
      
      Tone: Professional but modern, tech-savvy, slightly 'cool' but very helpful.
      
      Your knowledge:
      - We build custom static websites (fast, owned assets, no fees).
      - We also do Wix setups for clients who need to edit heavily.
      - We value: Clarity, Ownership, Ethics. No hidden fees.
      - Location: Calgary, but remote friendly.
      
      Keep answers short, helpful, and direct.`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "Connection error. (Missing API Key)";
  }

  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "No response data.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the server right now.";
  }
};