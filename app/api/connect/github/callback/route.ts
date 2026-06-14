// GitHub OAuth 콜백 — code→token→프로필을 표준 규격으로 변환 후 /connected로 전달.
import { exchangeCodeForToken, buildProfileFromGitHub } from '@/lib/github'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const code = new URL(request.url).searchParams.get('code')
  const fallback = `${origin}/connected?fallback=github`

  if (!code) return Response.redirect(fallback, 302)

  try {
    const token = await exchangeCodeForToken(code, `${origin}/api/connect/github/callback`)
    if (!token) return Response.redirect(fallback, 302)

    const profile = await buildProfileFromGitHub(token)
    if (!profile) return Response.redirect(fallback, 302)

    // 표준 프로필을 base64url로 인코딩해 클라이언트(/connected)로 전달
    const data = Buffer.from(JSON.stringify(profile), 'utf8').toString('base64url')
    return Response.redirect(`${origin}/connected?data=${data}`, 302)
  } catch {
    return Response.redirect(fallback, 302)
  }
}
