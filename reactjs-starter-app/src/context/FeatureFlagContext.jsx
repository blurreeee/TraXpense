import React, { createContext, useContext, useEffect, useState } from 'react'
import { message } from 'antd'

const FeatureFlagContext = createContext()

export function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/feature-flags')
        if (!response.ok) {
          throw new Error('Failed to fetch feature flags')
        }
        const data = await response.json()
        setFlags(data)
      } catch (error) {
        console.error('Error fetching feature flags:', error)
        // message.error('Failed to load feature flags')
      } finally {
        setLoading(false)
      }
    }

    fetchFlags()
  }, [])

  // Provide a function to check if a flag is enabled
  const isFeatureEnabled = (flagKey) => {
    // If flag exists in state, return its value, otherwise false
    return flags[flagKey] === true
  }

  // Update a flag locally and via API
  const toggleFlag = async (flagKey, enabled) => {
    try {
      const response = await fetch(`http://localhost:8080/api/feature-flags/${flagKey}?enabled=${enabled}`, {
        method: 'PUT',
      })
      if (!response.ok) throw new Error('Failed to update flag')
      setFlags(prev => ({ ...prev, [flagKey]: enabled }))
      message.success(`Feature flag ${flagKey} updated to ${enabled}`)
    } catch (error) {
      console.error('Error toggling flag:', error)
      message.error('Failed to update feature flag')
    }
  }

  return (
    <FeatureFlagContext.Provider value={{ isFeatureEnabled, flags, loading, toggleFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlag() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider')
  }
  return context.isFeatureEnabled
}

export function useFeatureFlagAdmin() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlagAdmin must be used within a FeatureFlagProvider')
  }
  return {
    flags: context.flags,
    loading: context.loading,
    toggleFlag: context.toggleFlag
  }
}
