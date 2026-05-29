import { GoogleGenAI } from '@google/genai'
import type { Stage1Data, Stage2Data, AnalysisResult } from '@/lib/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: Request) {
  const { stage1, stage2, result, targetCategory }: {
    stage1: Stage1Data
    stage2: Stage2Data | null
    result: AnalysisResult
    targetCategory: string
  } = await request.json()

  const prompt = `당신은 한국 최고의 이력서 전문가입니다.
아래 프로필을 바탕으로 ${targetCategory}에 최적화된 이력서 템플릿을 작성해주세요.

## 프로필
직무: ${stage1.jobCategory}
경력: ${stage1.experienceYears}
스킬: ${stage1.skills.join(', ')}
현재 회사 규모: ${stage1.companySize}
${stage2?.jobLevel ? `직급: ${stage2.jobLevel}` : ''}
이직 방향: ${result.directionType}
강점: ${result.strengths?.join(', ')}

## 출력 형식 (JSON만)
{
  "headline": "이력서 헤드라인 (1줄 포지셔닝)",
  "summary": "자기 요약 (3~4줄, 임팩트 있게)",
  "experience": [
    {
      "title": "직책명",
      "company": "[현재 회사 규모 기반 예시 회사명]",
      "period": "202X.XX ~ 현재",
      "bullets": ["핵심 성과 1 (수치 포함)", "핵심 성과 2", "핵심 성과 3"]
    }
  ],
  "skills": {
    "core": ["핵심 스킬 5개"],
    "tools": ["사용 툴 3~5개"],
    "soft": ["소프트 스킬 3개"]
  },
  "tips": ["이력서 작성 팁 3가지 (${targetCategory} 지원 특화)"]
}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 3000 },
  })

  const text = response.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return Response.json({ error: 'Failed to generate' }, { status: 500 })

  const resumeData = JSON.parse(match[0])
  return Response.json(resumeData)
}
