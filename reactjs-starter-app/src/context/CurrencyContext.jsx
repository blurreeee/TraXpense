// src/context/CurrencyContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getCurrency } from '../utils/currencies'

const CurrencyContext = createContext({
  currency: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  updateCurrency: async () => {},
})

export function CurrencyProvider({ children }) {
  const { user, setAuthState } = useAuth()

  const [currency, setCurrency] = useState(() => {
    const stored = user?.defaultCurrency
    return getCurrency(stored) || { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
  })

  // Keep in sync whenever the user object changes (login, settings update, etc.)
  useEffect(() => {
    if (user?.defaultCurrency) {
      const found = getCurrency(user.defaultCurrency)
      if (found) setCurrency(found)
    }
  }, [user?.defaultCurrency])

  async function updateCurrency(code) {
    if (!user) return { success: false, error: 'Not authenticated' }
    try {
      const response = await fetch(`/api/users/${user.id}/currency`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code }),
      })
      if (response.ok) {
        const updatedUser = await response.json()
        setAuthState(prev => ({ ...prev, user: updatedUser }))
        const found = getCurrency(code)
        if (found) setCurrency(found)
        return { success: true }
      }
      const err = await response.json().catch(() => null)
      return { success: false, error: err?.message || 'Failed to update currency' }
    } catch (err) {
      return { success: false, error: 'Network error' }
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
