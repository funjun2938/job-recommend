'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { DOMAINS, TOTAL_TABLES, COLOR } from '@/lib/admin/data'
import { LayoutDashboard, Menu, X, ExternalLink } from 'lucide-react'

/**
 * 관리자 셸 — 430px 폰 프레임을 벗어나기 위해 fixed inset-0 풀스크린.
 * 좌측 9개 도메인 네비 + 상단 바 + 콘텐츠 영역.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItem = (href: string, active: boolean, icon: React.ReactNode, label: string, badge?: string, color?: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
        active ? 'bg-white/15' : color ? COLOR[color].soft : 'bg-gray-100'
      }`}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{badge}</span>}
    </Link>
  )

  const sidebar = (
    <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm">J</div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-tight">careerly Admin</p>
            <p className="text-[11px] text-gray-400">9 도메인 · {TOTAL_TABLES} 테이블</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItem('/admin', pathname === '/admin', <LayoutDashboard size={15} />, '대시보드')}
        <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">도메인</div>
        {DOMAINS.map((d) =>
          navItem(`/admin/${d.key}`, pathname === `/admin/${d.key}`, d.icon, d.name, `${d.tables.length}`, d.color)
        )}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100">
          <ExternalLink size={13} /> 서비스로 돌아가기
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="fixed inset-0 z-[100] flex bg-gray-50 text-gray-900">
      {/* 데스크탑 사이드바 */}
      <div className="hidden md:flex">{sidebar}</div>

      {/* 모바일 드로어 */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[110] flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative">{sidebar}</div>
        </div>
      )}

      {/* 본문 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center gap-3 px-4 md:px-6">
          <button className="md:hidden p-1.5 -ml-1 text-gray-500" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="font-bold text-gray-900 text-sm">관리자 콘솔</span>
          <span className="ml-auto text-xs text-gray-400">demo · 목업 데이터</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">운</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {open && <button className="sr-only" onClick={() => setOpen(false)}><X size={1} /></button>}
    </div>
  )
}
