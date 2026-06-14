import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@/components/Analytics'
import { AppBar } from '@/components/AppBar'
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
  title: 'careerly — AI 맞춤 이직 추천',
  description: '계정 연동 또는 직접 입력 한 번으로 맞춤 이직처와 실제 채용공고를 받아보세요.',
  openGraph: {
    title: 'careerly — AI 맞춤 이직 추천',
    description: '연동 한 번으로 맞춤 이직처를 추천받는 커리어 플랫폼',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'careerly — AI 맞춤 이직 추천',
    description: '연동 한 번으로 맞춤 이직처를 추천받는 커리어 플랫폼',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-indigo-100 via-slate-100 to-purple-100 dark:bg-none dark:bg-gray-950">
        <ThemeProvider>
          <div className="mx-auto w-full max-w-[430px] min-h-screen bg-white dark:bg-gray-900 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30 relative overflow-x-hidden">
            <AppBar />
            {children}
          </div>
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
