import { GoogleGenAI } from '@google/genai'
import type { Stage1Data, AnalysisResult } from '@/lib/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: Request) {
  const { stage1, targetCategory, result }: {
    stage1: Stage1Data
    targetCategory: string
    result: AnalysisResult
  } = await request.json()

  const prompt = `당신은 한국 최고의 면접 코치입니다.
아래 지원자 프로필과 지원 기업군을 바탕으로 실전 면접 질문 10개와 모범 답변 가이드를 제공해주세요.

## 지원자 프로필
- 직무: ${stage1.jobCategory}
- 경력: ${stage1.experienceYears}
- 주요 스킬: ${stage1.skills.join(', ')}
- 현재 회사 규모: ${stage1.companySize}
- 이직 방향: ${result.directionType}

## 지원 대상
- 기업군: ${targetCategory}

## 출력 형식 (JSON만)
{
  "categories": [
    {
      "name": "카테고리명 (예: 지원 동기, 직무 역량, 경험/행동, 상황판단, 컬처핏)",
      "questions": [
        {
          "question": "면접 질문",
          "intent": "이 질문의 의도 (1줄)",
          "answerGuide": "모범 답변 구조/핵심 포인트 (3~5줄)",
          "tip": "실전 팁 (1줄)"
        }
      ]
    }
  ],
  "overallTips": ["전체 면접 전략 팁 3가지"]
}`

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 4000 },
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        if (chunk.text) controller.enqueue(new TextEncoder().encode(chunk.text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
