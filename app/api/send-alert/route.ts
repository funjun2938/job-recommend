import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  const { email, jobCategory, jobs } = await request.json()

  if (!resend) {
    return Response.json({ ok: true, skipped: 'no_api_key' })
  }

  const jobListHtml = jobs.slice(0, 5).map((j: any) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-weight:700;color:#111827;">${j.title}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${j.company} · ${j.location}</p>
        <a href="${j.url}" style="display:inline-block;margin-top:6px;font-size:12px;color:#4f46e5;font-weight:600;">지원하러 가기 →</a>
      </td>
    </tr>
  `).join('')

  const { error } = await resend.emails.send({
    from:    '이직추천 <alert@jobsuggest.co>',
    to:      email,
    subject: `[이직추천] ${jobCategory} 신규 채용공고 ${jobs.length}건`,
    html: `
    <!DOCTYPE html>
    <html lang="ko">
    <head><meta charset="utf-8"/></head>
    <body style="font-family:'-apple-system',sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.07);">
        <!-- 헤더 -->
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 24px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,.8);font-size:13px;">이직추천</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:900;">${jobCategory} 신규 공고</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px;">${jobs.length}개의 맞춤 공고가 올라왔어요</p>
        </div>
        <!-- 본문 -->
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            ${jobListHtml}
          </table>
          <a href="https://job-recommend-phi.vercel.app/analyze"
             style="display:block;margin-top:20px;text-align:center;background:#4f46e5;color:#fff;padding:14px;border-radius:12px;font-weight:700;text-decoration:none;font-size:14px;">
            더 많은 공고 보러 가기 →
          </a>
        </div>
        <!-- 푸터 -->
        <div style="padding:16px 24px;background:#f9fafb;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            알림을 해지하려면 <a href="https://job-recommend-phi.vercel.app" style="color:#6b7280;">여기를 클릭</a>하세요
          </p>
        </div>
      </div>
    </body>
    </html>
    `,
  })

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ ok: true })
}
