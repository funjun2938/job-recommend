import { saveAlertSubscription } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, timeline, stage1 } = await request.json()
  await saveAlertSubscription(email, timeline, stage1)
  return Response.json({ ok: true })
}
