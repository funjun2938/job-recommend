'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

export function TagInput({
  value,
  onChange,
  placeholder = '입력하고 Enter',
  maxTags = 5,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const availableSuggestions = suggestions.filter((s) => !value.includes(s)).slice(0, 8)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[52px] p-3 border border-gray-200 rounded-xl bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm px-2.5 py-1 rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-indigo-900 transition-colors"
            >
              <X size={13} />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[140px] outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
          />
        )}
      </div>
      {availableSuggestions.length > 0 && value.length < maxTags && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">
        {value.length}/{maxTags}개 · Enter 또는 쉼표로 구분
      </p>
    </div>
  )
}
