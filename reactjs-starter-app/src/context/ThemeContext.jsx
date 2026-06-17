import { createContext, useContext, useState, useLayoutEffect, useEffect } from 'react'
import { useAuth } from './AuthContext'

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
  const { user, setAuthState } = useAuth()

  // Sync with user preference on login/load
  useEffect(() => {
    if (user && user.isDarkTheme !== undefined) {
      setIsDark(user.isDarkTheme)
    }
  }, [user])

  // useLayoutEffect runs synchronously before paint — prevents flash of wrong theme
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    } catch { /* silent */ }
  }, [isDark])

  async function toggleTheme() {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (user) {
      try {
        const response = await fetch(`/api/users/${user.id}/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDarkTheme: newTheme })
        })
        if (response.ok) {
          const updatedUser = await response.json()
          setAuthState(prev => ({ ...prev, user: updatedUser }))
        }
      } catch (err) {
        console.error('Failed to update theme preference:', err)
      }
    }
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
