const KEY = 'job_favorites'

export interface FavoriteCompany {
  name: string
  category: string
  fitScore: number
  savedAt: string
}

export function getFavorites(): FavoriteCompany[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function toggleFavorite(company: FavoriteCompany): boolean {
  const favs = getFavorites()
  const idx  = favs.findIndex((f) => f.name === company.name)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem(KEY, JSON.stringify(favs))
    return false
  }
  favs.unshift({ ...company, savedAt: new Date().toISOString() })
  localStorage.setItem(KEY, JSON.stringify(favs.slice(0, 50)))
  return true
}

export function isFavorite(name: string): boolean {
  return getFavorites().some((f) => f.name === name)
}
