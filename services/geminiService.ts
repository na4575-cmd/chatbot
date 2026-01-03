
import { GroundingSource } from "../types";

export const getGeminiResponse = async (
  prompt: string, 
  latitude?: number, 
  longitude?: number
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        latitude,
        longitude
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text, sources: data.sources || [] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 
      sources: [] 
    };
  }
};
