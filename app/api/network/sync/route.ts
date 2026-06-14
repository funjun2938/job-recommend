// 명함첩(리멤버 류) 연동 — 동기화 + 네트워크/커리어 분석 mock 커넥터
//
// 실제로는 리멤버 OAuth → 명함 목록 fetch → namecards 적재 →
// 트리거로 company_network_edges / contact_transitions / career_paths 집계.
// 여기서는 연동된다고 가정하고 분석 결과를 합성해 반환한다.

import { buildNetworkAnalysis } from '@/lib/network'
import { saveRecommendationScores } from '@/lib/supabase'
import type { Stage1Data } from '@/lib/types'

export async function POST(request: Request) {
  const { stage1, categories } = (await request.json()) as { stage1: Stage1Data; categories?: string[] }

  if (!stage1?.jobCategory) {
    return Response.json({ error: 'stage1 필요' }, { status: 400 })
  }

  // 실제 연동 지연 시뮬레이션
  await new Promise((r) => setTimeout(r, 600))

  // 다중 소스 직군을 섞어(mingle) 분석 — 주 직군 외 소스 직군 추가
  const extra = (categories ?? []).filter((c) => c && c !== stage1.jobCategory)
  const analysis = buildNetworkAnalysis(stage1, extra)

  // 3축 추천 점수를 recommendation_scores 테이블에 적재 (Supabase 설정 시)
  saveRecommendationScores(analysis.scores, analysis.weights).catch(() => {})

  return Response.json(analysis)
}
