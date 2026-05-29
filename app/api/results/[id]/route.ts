import { supabase } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!supabase) {
    return Response.json({ error: 'Storage not configured' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('shared_results')
    .select('result_json, stage1_json, created_at')
    .eq('share_id', id)
    .single()

  if (error || !data) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({
    result: data.result_json,
    stage1: data.stage1_json,
    createdAt: data.created_at,
  })
}
