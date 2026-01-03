import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// API 엔드포인트
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, latitude, longitude } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'GEMINI_API_KEY environment variable is missing. Please set it in .env.local file.'
      });
    }

    // 동적 import로 @google/genai 사용
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const SYSTEM_INSTRUCTION = `당신은 대한민국 세종특별자치시를 전문적으로 소개하는 '세종시 안내 AI 가이드'입니다. 
사용자에게 세종시의 다양한 행정구역(동), 랜드마크, 공원, 맛집, 축제 정보를 친절하고 상세하게 설명해 주세요.
반드시 구글 검색(Google Search Grounding) 기능을 활용하여 최신의 정보를 제공해야 하며, 답변 하단에 참고한 출처 링크를 명확히 표시해야 합니다.
세종시의 특징인 '스마트 시티', '행정 중심 복합 도시', '풍부한 녹지' 등의 키워드를 잘 살려서 답변해 주세요.

특히 장소에 대한 질문인 경우 주소와 위치 정보를 지도 기반으로 정확히 안내해 주세요.`;

    const response = await ai.models.generateContent({
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
    const sources = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          if (!sources.find(s => s.uri === chunk.web.uri)) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri,
              type: 'web'
            });
          }
        }
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
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      text: '서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      sources: []
    });
  }
});

// Vite 개발 서버 프록시를 위한 정적 파일 서빙
app.use(express.static(join(__dirname, 'dist')));

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);
});
