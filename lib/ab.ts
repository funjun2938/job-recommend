/**
 * 간단한 클라이언트 A/B 테스트 시스템
 * 사용자 ID(없으면 랜덤)를 기반으로 일관된 버킷 배정
 */

const FLAGS: Record<string, { variants: string[]; weights: number[] }> = {
  landing_cta_text: {
    variants: ['무료로 분석받기', '지금 내 이직 방향 확인하기', 'AI로 이직처 찾기'],
    weights: [50, 30, 20],
  },
  show_peer_moves_first: {
    variants: ['control', 'variant'],
    weights: [50, 50],
  },
  salary_benchmark_style: {
    variants: ['bar', 'number'],
    weights: [60, 40],
  },
}

function getUserBucket(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('ab_user_id')
  if (!id) {
    id = Math.random().toString(36).slice(2, 10)
    localStorage.setItem('ab_user_id', id)
  }
  return id
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getVariant(flagName: string): string {
  const flag = FLAGS[flagName]
  if (!flag) return 'control'

  const bucket = getUserBucket()
  const hash = hashCode(`${flagName}:${bucket}`) % 100
  let cumulative = 0

  for (let i = 0; i < flag.variants.length; i++) {
    cumulative += flag.weights[i]
    if (hash < cumulative) return flag.variants[i]
  }

  return flag.variants[0]
}

export function trackEvent(eventName: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return
  // GA4 이벤트 전송
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, props)
  }
  // 콘솔 로그 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AB] ${eventName}`, props)
  }
}
