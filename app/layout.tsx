import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@/components/Analytics'
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)',  color: '#1e1b4b' },
  ],
}

export const metadata: Metadata = {
  title: '이직추천 — AI 맞춤 이직처 분석',
  description: '현재 직무·연봉·회사 정보를 알려주면 맞춤 이직처와 실제 채용공고를 드려요.',
  openGraph: {
    title: '이직추천 — AI 맞춤 이직처 분석',
    description: '현황 입력 → 회사 정보 교환 → 맞춤 이직처 잠금 해제',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '이직추천 — AI 맞춤 이직처 분석',
    description: '현황 입력 → 회사 정보 교환 → 맞춤 이직처 잠금 해제',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-indigo-100 via-slate-100 to-purple-100 dark:bg-none dark:bg-gray-950">
        <ThemeProvider>
          <div className="mx-auto w-full max-w-[430px] min-h-screen bg-white dark:bg-gray-900 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30 relative overflow-x-hidden">
            {children}
          </div>
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
