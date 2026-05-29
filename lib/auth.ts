import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function createClient() {
  if (!url || !key) return null
  return createBrowserClient(url, key)
}

export async function getUser() {
  const client = createClient()
  if (!client) return null
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function signInWithGoogle() {
  const client = createClient()
  if (!client) return
  await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export async function signInWithKakao() {
  const client = createClient()
  if (!client) return
  await client.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export async function signOut() {
  const client = createClient()
  if (!client) return
  await client.auth.signOut()
}
