import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4F46E5',
}

export const metadata: Metadata = {
  title: '이직추천 — AI 맞춤 이직처 분석',
  description: '현재 직무·연봉·회사 정보를 알려주면 맞춤 이직처와 실제 채용공고를 드려요.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      {/* 데스크탑: 인디고 그라디언트 배경 + 중앙 폰 프레임 */}
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-indigo-100 via-slate-100 to-purple-100">
        <div className="mx-auto w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-indigo-200/50 relative overflow-x-hidden">
          {children}
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
