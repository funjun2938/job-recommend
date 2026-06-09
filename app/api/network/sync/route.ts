// 명함첩(리멤버 류) 연동 — 동기화 + 네트워크/커리어 분석 mock 커넥터
//
// 실제로는 리멤버 OAuth → 명함 목록 fetch → namecards 적재 →
// 트리거로 company_network_edges / contact_transitions / career_paths 집계.
// 여기서는 연동된다고 가정하고 분석 결과를 합성해 반환한다.

import { buildNetworkAnalysis } from '@/lib/network'
import { saveRecommendationScores } from '@/lib/supabase'
import type { Stage1Data } from '@/lib/types'

export async function POST(request: Request) {
  const { stage1 } = (await request.json()) as { stage1: Stage1Data }

  if (!stage1?.jobCategory) {
    return Response.json({ error: 'stage1 필요' }, { status: 400 })
  }

  // 실제 연동 지연 시뮬레이션
  await new Promise((r) => setTimeout(r, 600))

  const analysis = buildNetworkAnalysis(stage1)

  // 3축 추천 점수를 recommendation_scores 테이블에 적재 (Supabase 설정 시)
  saveRecommendationScores(analysis.scores, analysis.weights).catch(() => {})

  return Response.json(analysis)
}
