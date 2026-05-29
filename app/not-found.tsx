import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white space-y-6">
      <div className="text-6xl">🔍</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900">페이지를 찾을 수 없어요</h1>
        <p className="text-gray-500 text-sm">이직 분석을 먼저 받아보세요</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm"
      >
        홈으로 가기 <ArrowRight size={16} />
      </Link>
    </div>
  )
}
