import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get('key')

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabase) {
    return Response.json({
      message: 'Supabase not configured — showing mock stats',
      stats: getMockStats(),
    })
  }

  const [insightsResult, alertsResult] = await Promise.all([
    supabase.from('company_insights').select('job_category, company_size, actual_salary, nps_score, stay_probability, resignation_reasons, created_at'),
    supabase.from('alert_subscriptions').select('job_category, is_active'),
  ])

  const insights = insightsResult.data ?? []
  const alerts   = alertsResult.data ?? []

  // 집계 계산
  const totalInsights = insights.length
  const totalAlerts   = alerts.filter((a) => a.is_active).length
  const avgSalary     = insights.filter((i) => i.actual_salary).reduce((s, i) => s + i.actual_salary, 0) / (insights.filter((i) => i.actual_salary).length || 1)
  const avgNps        = insights.filter((i) => i.nps_score != null).reduce((s, i) => s + i.nps_score, 0) / (insights.filter((i) => i.nps_score != null).length || 1)

  const byCat = insights.reduce<Record<string, number>>((acc, i) => {
    acc[i.job_category] = (acc[i.job_category] ?? 0) + 1
    return acc
  }, {})

  const topExitReasons = insights
    .flatMap((i) => i.resignation_reasons ?? [])
    .reduce<Record<string, number>>((acc, r) => { acc[r] = (acc[r] ?? 0) + 1; return acc }, {})

  const sortedReasons = Object.entries(topExitReasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }))

  return Response.json({
    summary: {
      totalInsights,
      totalAlerts,
      avgSalary: Math.round(avgSalary),
      avgNps:    Math.round(avgNps * 10) / 10,
    },
    byJobCategory:    byCat,
    topExitReasons:   sortedReasons,
    generatedAt: new Date().toISOString(),
  })
}

function getMockStats() {
  return {
    summary: { totalInsights: 247, totalAlerts: 89, avgSalary: 5280, avgNps: 4.1 },
    byJobCategory: { '개발·엔지니어': 98, '기획·PM': 52, '마케팅·광고': 41, '영업·BD': 31, '금융·회계': 25 },
    topExitReasons: [
      { reason: '연봉·처우가 낮아서',      count: 142 },
      { reason: '성장·배움이 멈춘 느낌',    count: 119 },
      { reason: '조직문화가 맞지 않아서',   count: 87  },
      { reason: '회사 비전이 없어 보여서',  count: 63  },
      { reason: '워라밸이 너무 안 좋아서',  count: 58  },
    ],
  }
}
