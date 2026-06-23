// src/hooks/useExchangeRates.js
import { useState, useEffect } from 'react'

/**
 * Module-level cache: { "INR-2025-06-22": { USD: 0.0106, EUR: 0.00924, ... } }
 * Keyed by "BASE-YYYY-MM-DD" so rates are refetched at most once per day.
 */
const ratesCache = {}

function getTodayKey(base) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `${base}-${today}`
}

/**
 * Fetches live exchange rates from the Frankfurter API.
 * Returns rates where: 1 unit of `defaultCurrency` = rates[X] units of X.
 *
 * Conversion formula (expense in currency X → default currency):
 *   convertedAmount = expenseAmount / rates[X]
 *
 * @param {string} defaultCurrencyCode  e.g. "INR", "USD"
 */
export function useExchangeRates(defaultCurrencyCode) {
  const [rates, setRates] = useState(null)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState(null)

  useEffect(() => {
    if (!defaultCurrencyCode) return

    const cacheKey = getTodayKey(defaultCurrencyCode)

    // Return cached result immediately without hitting the network
    if (ratesCache[cacheKey]) {
      setRates(ratesCache[cacheKey])
      setRatesLoading(false)
      setRatesError(null)
      return
    }

    let cancelled = false
    setRatesLoading(true)
    setRatesError(null)

    fetch(`/api/rates/latest?from=${defaultCurrencyCode}`)
      .then(res => {
        if (!res.ok) throw new Error(`ExchangeRate-API error: ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        
        if (data.result === 'error') {
          throw new Error(data['error-type'] || 'Unknown ExchangeRate-API error')
        }

        // data.conversion_rates: { USD: 1, EUR: 0.92, ... }
        const apiRates = data.conversion_rates || data.rates || {}
        
        // Add identity so we don't need a special case for same-currency expenses
        const fullRates = { ...apiRates, [defaultCurrencyCode]: 1 }
        ratesCache[cacheKey] = fullRates
        setRates(fullRates)
        setRatesLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error('useExchangeRates: failed to fetch rates', err)
        setRatesError(err.message)
        setRatesLoading(false)
      })

    return () => { cancelled = true }
  }, [defaultCurrencyCode])

  /**
   * Converts an amount from `fromCurrency` into the user's default currency.
   * Returns null if the rate is unavailable (expense will be excluded from aggregates).
   *
   * @param {number|string} amount
   * @param {string}        fromCurrency  e.g. "INR"
   * @returns {number|null}
   */
  function convertToDefault(amount, fromCurrency) {
    const num = Number(amount)
    if (isNaN(num)) return null
    if (!fromCurrency || fromCurrency === defaultCurrencyCode) return num
    if (!rates) return null                    // still loading
    const rate = rates[fromCurrency.toUpperCase()]
    if (!rate) return null                     // unsupported currency
    // 1 defaultCurrency = rate[X] units of X  →  X / rate[X] = defaultCurrency
    return num / rate
  }

  return { rates, ratesLoading, ratesError, convertToDefault }
}
