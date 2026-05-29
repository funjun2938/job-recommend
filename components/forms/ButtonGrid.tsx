'use client'

interface Option {
  value: string
  label?: string
}

interface ButtonGridProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  columns?: 2 | 3
}

export function ButtonGrid({ options, value, onChange, columns = 2 }: ButtonGridProps) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
            value === opt.value
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
          }`}
        >
          {opt.label ?? opt.value}
        </button>
      ))}
    </div>
  )
}

interface MultiButtonGridProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  columns?: 2 | 3
  maxSelect?: number
}

export function MultiButtonGrid({
  options,
  value,
  onChange,
  columns = 2,
  maxSelect,
}: MultiButtonGridProps) {
  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v))
    } else {
      if (maxSelect && value.length >= maxSelect) return
      onChange([...value, v])
    }
  }

  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
            value.includes(opt.value)
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
          }`}
        >
          {opt.label ?? opt.value}
        </button>
      ))}
    </div>
  )
}
