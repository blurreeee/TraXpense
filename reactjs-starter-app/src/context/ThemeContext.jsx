import { createContext, useContext, useState, useLayoutEffect } from 'react'

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} })

const THEME_KEY = 'traxpenses_theme'

function getInitialDark() {
  try {
    return localStorage.getItem(THEME_KEY) !== 'light'
  } catch {
    return true
  }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialDark)

  // useLayoutEffect runs synchronously before paint — prevents flash of wrong theme
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    } catch { /* silent */ }
  }, [isDark])

  function toggleTheme() {
    setIsDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
