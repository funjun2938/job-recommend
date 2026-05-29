import { GoogleGenAI } from '@google/genai'
import type { Stage1Data, Stage2Data, AnalysisResult } from '@/lib/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

function buildCoverLetterPrompt(
  stage1: Stage1Data,
  stage2: Stage2Data | null,
  targetCategory: string,
  targetCompany: string
): string {
  return `당신은 한국 최고의 취업 컨설턴트이자 자기소개서 전문가입니다.
아래 지원자 프로필을 바탕으로 ${targetCompany || targetCategory}에 지원하는 자기소개서를 작성해주세요.

## 지원자 프로필
- 직무: ${stage1.jobCategory}
- 경력: ${stage1.experienceYears}
- 주요 스킬: ${stage1.skills.join(', ') || '미입력'}
- 현재 회사 규모: ${stage1.companySize}
${stage2 ? `- 현재 직급: ${stage2.jobLevel || '미입력'}
- 이직 이유: ${stage2.resignationReasons.join(', ')}
- 현재 회사 강점: ${stage2.pros.join(', ')}` : ''}

## 지원 대상
- 기업군: ${targetCategory}
${targetCompany ? `- 희망 기업: ${targetCompany}` : ''}

## 자기소개서 작성 지침
1. 총 4개 문항으로 구성
2. 각 문항 400~600자
3. 구체적인 경험과 수치 포함 (추정 수치 사용 가능)
4. 지원 기업의 문화/방향성에 맞는 톤
5. 첫 문장은 반드시 임팩트 있게 시작
6. 겸손하되 자신감 있는 어조

## 출력 형식 (JSON만)
{
  "title": "자기소개서 제목",
  "targetInfo": "${targetCompany || targetCategory} 지원용",
  "sections": [
    {
      "question": "문항 제목 (예: 지원 동기)",
      "answer": "400~600자 본문"
    }
  ],
  "writingTips": ["이 자소서의 강점 또는 보완 팁 2~3가지"]
}`
}

export async function POST(request: Request) {
  const { stage1, stage2, targetCategory, targetCompany } = await request.json()

  const prompt = buildCoverLetterPrompt(stage1, stage2, targetCategory, targetCompany)

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
