
import React from 'react';
import { SejongArea } from './types';

export const SYSTEM_INSTRUCTION = `당신은 대한민국 세종특별자치시를 전문적으로 소개하는 '세종시 안내 AI 가이드'입니다. 
사용자에게 세종시의 다양한 행정구역(동), 랜드마크, 공원, 맛집, 축제 정보를 친절하고 상세하게 설명해 주세요.
반드시 구글 검색(Google Search Grounding) 기능을 활용하여 최신의 정보를 제공해야 하며, 답변 하단에 참고한 출처 링크를 명확히 표시해야 합니다.
세종시의 특징인 '스마트 시티', '행정 중심 복합 도시', '풍부한 녹지' 등의 키워드를 잘 살려서 답변해 주세요.`;

export const RECOMMENDED_AREAS: SejongArea[] = [
  {
    name: "세종호수공원",
    description: "국내 최대 규모의 인공 호수로 세종시의 대표적인 휴식처입니다.",
    icon: "fa-water",
    tags: ["산책", "야경", "가족나들이"]
  },
  {
    name: "정부세종청사 옥상정원",
    description: "세계 최대 규모의 옥상 정원으로 기네스북에 등재되었습니다.",
    icon: "fa-building",
    tags: ["명소", "기네스북", "전망"]
  },
  {
    name: "이응다리 (금강보행교)",
    description: "한글 'ㅇ'을 형상화한 국내 유일의 원형 보행교입니다.",
    icon: "fa-bridge",
    tags: ["랜드마크", "야경명소", "자전거"]
  },
  {
    name: "국립세종수목원",
    description: "도심 속에 위치한 국내 최초의 국립 도심형 수목원입니다.",
    icon: "fa-leaf",
    tags: ["힐링", "사계절온실", "전시"]
  }
];
