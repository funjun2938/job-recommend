import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '이직추천 — AI 맞춤 이직처 분석'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        fontFamily: 'sans-serif',
        padding: '60px',
      }}
    >
      {/* 로고 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>
          📈
        </div>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 32, fontWeight: 700 }}>
          이직추천
        </span>
      </div>

      {/* 메인 카피 */}
      <h1 style={{
        color: '#ffffff',
        fontSize: 64,
        fontWeight: 900,
        textAlign: 'center',
        lineHeight: 1.15,
        marginBottom: 24,
      }}>
        당신의 이직,<br />AI가 먼저 찾아드립니다
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.75)',
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 48,
      }}>
        현황 입력 → 회사 정보 교환 → 맞춤 이직처 잠금 해제
      </p>

      {/* 배지들 */}
      <div style={{ display: 'flex', gap: 16 }}>
        {['무료 분석', '3분 소요', 'AI 분석', '실 채용공고 연동'].map((badge) => (
          <div key={badge} style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 999,
            padding: '10px 24px',
            color: 'white',
            fontSize: 20,
            fontWeight: 600,
          }}>
            {badge}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  )
}
