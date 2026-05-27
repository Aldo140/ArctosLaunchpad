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
      systemInstruction: `You are the Operational Intelligence Assistant for PolarOps.

      Tone: Professional, clear, and helpful—like a senior product engineer explaining options to a client.

      Your knowledge:
      - PolarOps engineers elite digital infrastructure for modern enterprises.
      - Offerings include custom static/React sites, civic and map-based products, Wix/Editor X when clients need heavy self-serve editing, and integrations (e.g. Firebase, Google Sheets / Apps Script backends).
      - Values: transparent scope, ownership of code and content, accessibility and performance, privacy-conscious UX where needed.
      - CTAs on the site point visitors to book a free fit call or use the contact form.

      Keep answers concise and actionable.`,
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