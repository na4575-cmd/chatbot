import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const SYSTEM_INSTRUCTION = `당신은 대한민국 세종특별자치시를 전문적으로 소개하는 '세종시 안내 AI 가이드'입니다. 
사용자에게 세종시의 다양한 행정구역(동), 랜드마크, 공원, 맛집, 축제 정보를 친절하고 상세하게 설명해 주세요.
반드시 구글 검색(Google Search Grounding) 기능을 활용하여 최신의 정보를 제공해야 하며, 답변 하단에 참고한 출처 링크를 명확히 표시해야 합니다.
세종시의 특징인 '스마트 시티', '행정 중심 복합 도시', '풍부한 녹지' 등의 키워드를 잘 살려서 답변해 주세요.

특히 장소에 대한 질문인 경우 주소와 위치 정보를 지도 기반으로 정확히 안내해 주세요.`;

interface GroundingSource {
  title: string;
  uri: string;
  type: 'web' | 'maps';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, latitude, longitude } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API')));
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'GEMINI_API_KEY environment variable is missing. Please set it in Vercel dashboard.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ],
        toolConfig: latitude && longitude ? {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        } : undefined
      },
    });

    const text = response.text || '죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.';
    const sources: GroundingSource[] = [];

    // Extract grounding sources from metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        // Handle Web Search Grounding
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          if (!sources.find(s => s.uri === chunk.web.uri)) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri,
              type: 'web'
            });
          }
        }
        // Handle Google Maps Grounding
        if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
          if (!sources.find(s => s.uri === chunk.maps.uri)) {
            sources.push({
              title: chunk.maps.title,
              uri: chunk.maps.uri,
              type: 'maps'
            });
          }
        }
      });
    }

    return res.status(200).json({ text, sources });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      text: '서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      sources: []
    });
  }
}
