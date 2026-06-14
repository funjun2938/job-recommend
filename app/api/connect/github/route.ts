// GitHub OAuth 시작 — authorize로 리다이렉트. env 미설정 시 더미 폴백.
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const clientId = process.env.GITHUB_CLIENT_ID

  // OAuth App 미설정 → 더미 프로필로 폴백 (데모 동작 유지)
  if (!clientId) {
    return Response.redirect(`${origin}/connected?fallback=github`, 302)
  }

  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', clientId)
  authorize.searchParams.set('redirect_uri', `${origin}/api/connect/github/callback`)
  authorize.searchParams.set('scope', 'read:user user:email')
  authorize.searchParams.set('state', 'jobfit')
  return Response.redirect(authorize.toString(), 302)
}
