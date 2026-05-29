import { saveCompanyInsight } from '@/lib/supabase'

export async function POST(request: Request) {
  const { stage1, stage2 } = await request.json()
  await saveCompanyInsight(stage1, stage2)
  return Response.json({ ok: true })
}
