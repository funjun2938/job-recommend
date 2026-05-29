'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white space-y-6">
      <div className="text-6xl">⚡</div>
      <div className="space-y-2">
        <h1 className="text-xl font-black text-gray-900">잠깐, 오류가 발생했어요</h1>
        <p className="text-gray-500 text-sm">잠시 후 다시 시도하거나 처음부터 시작해보세요</p>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 border-2 border-indigo-200 text-indigo-600 rounded-2xl font-bold text-sm"
        >
          <RotateCcw size={14} /> 다시 시도
        </button>
        <Link
          href="/"
          className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm text-center"
        >
          처음으로
        </Link>
      </div>
    </div>
  )
}
