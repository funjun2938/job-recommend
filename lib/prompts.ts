import type { Stage1Data, Stage2Data } from './types'

export function buildAnalysisPrompt(stage1: Stage1Data, stage2?: Stage2Data | null): string {
  const stage2Section = stage2 && stage2.resignationReasons.length > 0
    ? `
## 회사 내부 정보 (기밀)
- 직급/레벨: ${stage2.jobLevel}
- 실제 연봉: ${stage2.actualSalary}만원${stage2.companyName ? `\n- 회사명: ${stage2.companyName}` : ''}
- 이직 고민 이유: ${stage2.resignationReasons.join(', ')}
- 현재 회사 장점: ${stage2.pros.length > 0 ? stage2.pros.join(', ') : '없음'}
- 현재 회사 단점: ${stage2.cons.length > 0 ? stage2.cons.join(', ') : '없음'}
- 경영진 신뢰도: ${stage2.mgmtTrustScore}/5
- 1년 후 재직 의향: ${stage2.stayProbability}%
- 회사 추천 의향(NPS): ${stage2.npsScore}/10
`
    : ''

  return `당신은 한국 취업시장 전문 커리어 컨설턴트 AI입니다. 아래 사용자 프로필을 분석하여 최적의 이직 방향과 구체적인 추천을 제공해주세요.

## 현재 상황
- 직무: ${stage1.jobCategory}
- 경력: ${stage1.experienceYears}
- 현재 연봉 구간: ${stage1.salaryRange}
- 주요 스킬/역량: ${stage1.skills.length > 0 ? stage1.skills.join(', ') : '미입력'}
- 현재 회사 규모: ${stage1.companySize}
${stage2Section}
아래 JSON 형식으로만 응답해주세요. 마크다운 코드블록 없이 JSON만:

{
  "diagnosis": "현재 상황 진단 2-3문장. 직무, 경력, 회사규모를 종합한 구체적 분석.",
  "directionType": "상향이직 또는 수평이동 또는 업종전환 또는 스타트업전환 또는 대기업이직 중 하나",
  "directionSummary": "이직 방향 설명 3-4문장. 왜 이 방향이 적합한지 구체적인 이유.",
  "recommendations": [
    {
      "category": "추천 기업군 이름 (예: 테크 유니콘, 대형 IT기업, 외국계 테크)",
      "companies": ["실제 한국 기업명 3-4개"],
      "fitScore": 85,
      "reason": "이 기업군을 추천하는 이유 2-3문장"
    }
  ],
  "strengths": ["강점 항목 3-4개, 구체적으로"],
  "gaps": ["보완이 필요한 부분 2-3개, 구체적으로"],
  "actionPlan": [
    {"action": "지금 당장 할 수 있는 구체적인 액션", "timeline": "이번 주"},
    {"action": "단기 준비 사항", "timeline": "2주 내"},
    {"action": "중기 준비 사항", "timeline": "1개월 내"}
  ],
  "warnings": ["현실적 주의사항 1-2개"]
}

중요 규칙:
- 모든 내용 한국어
- 실제 한국 기업명 사용 (IT: 카카오·네이버·토스·당근·쿠팡·라인·야놀자·무신사·배달의민족, 금융: 카카오뱅크·토스뱅크·삼성증권·미래에셋, 외국계: 구글·애플·아마존·세일즈포스·SAP)
- 직군에 맞는 기업만 추천 (개발자에게 금융사 추천하지 않기)
- 추천 기업군 3~5개, fitScore는 0~100 정수
- diagnosis는 현재 상황을 공감하는 톤으로, 판단하지 말고 분석하는 어조
- warnings는 현실적이되 희망을 꺾지 않게, 구체적인 수치 포함
- actionPlan의 각 action은 "무엇을 → 어떻게" 형식으로 구체적으로`
}
