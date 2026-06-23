import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const FeatureFlagContext = createContext()

export function FeatureFlagProvider({ children }) {
  const { user } = useAuth()
  const [flags, setFlags] = useState(user?.featureFlags || {})

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch('/api/feature-flags')
        if (response.ok) {
          const data = await response.json()
          setFlags(data)
        }
      } catch (error) {
        console.error('Error fetching feature flags:', error)
      }
    }
    // Always fetch fresh flags on mount to avoid stale localStorage issues
    fetchFlags()
  }, [])

  // Provide a function to check if a flag is enabled
  const isFeatureEnabled = (flagKey) => {
    // If flag exists in state, return its value, otherwise false
    return flags[flagKey] === true
  }

  return (
    <FeatureFlagContext.Provider value={isFeatureEnabled}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlag() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider')
  }
  return context
}
