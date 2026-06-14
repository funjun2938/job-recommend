import { createClient } from '@supabase/supabase-js'
import type { Stage1Data, Stage2Data, RecommendationScore, ScoreWeights } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function saveCompanyInsight(stage1: Stage1Data, stage2: Stage2Data) {
  if (!supabase) return
  await supabase.from('company_insights').insert({
    job_category: stage1.jobCategory,
    experience_years: stage1.experienceYears,
    salary_range: stage1.salaryRange,
    skills: stage1.skills,
    company_size: stage1.companySize,
    company_name: stage2.companyName || null,
    job_level: stage2.jobLevel,
    actual_salary: Number(stage2.actualSalary) || null,
    resignation_reasons: stage2.resignationReasons,
    pros: stage2.pros,
    cons: stage2.cons,
    mgmt_trust_score: stage2.mgmtTrustScore,
    stay_probability: stage2.stayProbability,
    nps_score: stage2.npsScore,
  })
}

export async function saveAlertSubscription(
  email: string,
  timeline: string,
  stage1: Stage1Data
) {
  if (!supabase) return
  await supabase.from('alert_subscriptions').insert({
    email,
    timeline,
    job_category: stage1.jobCategory,
    company_size: stage1.companySize,
  })
}

/** 4-신호 하이브리드 추천 점수(Hybrid v3)를 recommendation_scores 테이블에 적재 */
export async function saveRecommendationScores(
  scores: RecommendationScore[],
  weights: ScoreWeights,
  userId: string | null = null
) {
  if (!supabase || scores.length === 0) return
  await supabase.from('recommendation_scores').insert(
    scores.map((s) => ({
      user_id: userId,
      company_name: s.company,
      cbf_score: s.cbf,
      cf_score: s.cf,
      graph_score: s.graph,
      network_score: s.network,
      weight_cbf: weights.cbf,
      weight_cf: weights.cf,
      weight_graph: weights.graph,
      weight_network: weights.network,
      final_score: s.finalScore,
    }))
  )
}
