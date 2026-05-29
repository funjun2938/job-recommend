import { supabase } from '@/lib/supabase'
import { nanoid } from '@/lib/nanoid'
import type { AnalysisResult, Stage1Data } from '@/lib/types'

export async function POST(request: Request) {
  const { result, stage1 }: { result: AnalysisResult; stage1: Stage1Data } =
    await request.json()

  const shareId = nanoid(8)

  if (!supabase) {
    // Supabase 없을 때도 동작하도록 — base64 인코딩 URL 반환
    const encoded = Buffer.from(
      JSON.stringify({ result, stage1 })
    ).toString('base64url')
    return Response.json({ shareId: `preview_${encoded.slice(0, 40)}`, preview: true })
  }

  const { error } = await supabase.from('shared_results').insert({
    share_id:    shareId,
    result_json: result,
    stage1_json: stage1,
    created_at:  new Date().toISOString(),
    expires_at:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ shareId, url: `/r/${shareId}` })
}
