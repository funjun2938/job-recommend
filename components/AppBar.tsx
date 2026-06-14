'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * 전역 앱 상단 바 — 항상 로고를 노출하고, 누르면 메인(/)으로.
 * 관리자(/admin)는 자체 풀스크린 셸을 쓰므로 제외.
 */
export function AppBar() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-50 h-11 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 flex items-center justify-center">
      <Link href="/" aria-label="careerly 메인으로" className="flex items-center gap-1.5 active:opacity-70">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-[11px]">C</span>
        <span className="font-black text-gray-900 dark:text-gray-100 text-sm tracking-tight">careerly</span>
      </Link>
    </header>
  )
}
