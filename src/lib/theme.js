import { useEffect, useState } from 'react'

export const THEMES = [
  { id: 'cream',  label: 'Cream',  description: 'Warm, default. Cream + teal + gold.' },
  { id: 'night',  label: 'Night',  description: 'Dark mode. Deep teal background, cream text.' },
  { id: 'sand',   label: 'Sand',   description: 'Warmer beige. Softer than cream.' },
  { id: 'forest', label: 'Forest', description: 'Deeper greens, muted gold.' },
]

const STORAGE_KEY = 'ourpath-theme'

function readStoredTheme() {
  try {
    const t = localStorage.getItem(STORAGE_KEY)
    if (THEMES.some(x => x.id === t)) return t
  } catch (_) { /* SSR / disabled storage */ }
  return 'cream'
}

// Apply on load — called once from main.jsx so the first paint already
// reflects the user's choice (no flash of default theme).
export function applyStoredTheme() {
  const t = readStoredTheme()
  document.documentElement.setAttribute('data-theme', t)
}

export function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch (_) {}
  }, [theme])
  return [theme, setTheme]
}
