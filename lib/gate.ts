'use client'

/**
 * 프리미엄 기능 게이팅
 * Supabase 없을 때는 localStorage 기반 간이 카운터 사용
 */

const COUNTS_KEY = 'feature_counts'
const PLAN_KEY   = 'user_plan'   // 'free' | 'pro' | 'team'

interface FeatureCounts {
  analysis:    { count: number; resetAt: string }
  coverLetter: { count: number; resetAt: string }
}

function getMonthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getCounts(): FeatureCounts {
  if (typeof window === 'undefined') return {
    analysis:    { count: 0, resetAt: getMonthStart() },
    coverLetter: { count: 0, resetAt: getMonthStart() },
  }
  try {
    const raw = localStorage.getItem(COUNTS_KEY)
    if (!raw) throw new Error()
    const parsed: FeatureCounts = JSON.parse(raw)
    // 월 리셋
    const monthStart = getMonthStart()
    if (parsed.analysis.resetAt !== monthStart) {
      return {
        analysis:    { count: 0, resetAt: monthStart },
        coverLetter: { count: 0, resetAt: monthStart },
      }
    }
    return parsed
  } catch {
    return {
      analysis:    { count: 0, resetAt: getMonthStart() },
      coverLetter: { count: 0, resetAt: getMonthStart() },
    }
  }
}

function saveCounts(counts: FeatureCounts) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts))
}

export function getUserPlan(): 'free' | 'pro' | 'team' {
  if (typeof window === 'undefined') return 'free'
  return (localStorage.getItem(PLAN_KEY) as any) ?? 'free'
}

// Stripe 결제 성공 후 플랜 업데이트
export function setUserPlan(plan: 'free' | 'pro' | 'team') {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLAN_KEY, plan)
}

export function canUseAnalysis(): { allowed: boolean; remaining: number; upgradeNeeded: boolean } {
  const plan = getUserPlan()
  if (plan !== 'free') return { allowed: true, remaining: Infinity, upgradeNeeded: false }
  const counts = getCounts()
  const limit = 1
  const remaining = Math.max(0, limit - counts.analysis.count)
  return { allowed: remaining > 0, remaining, upgradeNeeded: remaining === 0 }
}

export function consumeAnalysis() {
  const plan = getUserPlan()
  if (plan !== 'free') return
  const counts = getCounts()
  counts.analysis.count++
  saveCounts(counts)
}

export function canUseCoverLetter(): { allowed: boolean; remaining: number; upgradeNeeded: boolean } {
  const plan = getUserPlan()
  if (plan === 'team') return { allowed: true, remaining: Infinity, upgradeNeeded: false }
  if (plan === 'pro') {
    const counts = getCounts()
    const limit = 5
    const remaining = Math.max(0, limit - counts.coverLetter.count)
    return { allowed: remaining > 0, remaining, upgradeNeeded: remaining === 0 }
  }
  return { allowed: false, remaining: 0, upgradeNeeded: true }
}

export function consumeCoverLetter() {
  const plan = getUserPlan()
  if (plan === 'free') return
  const counts = getCounts()
  counts.coverLetter.count++
  saveCounts(counts)
}
