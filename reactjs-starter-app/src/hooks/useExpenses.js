import { useState, useEffect, useCallback } from 'react'

const API_URL = '/api/expenses'

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchExpenses()
    } else {
      setLoading(false)
    }
  }, [userId, fetchExpenses])

  async function addExpense(expenseData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, userId }),
      })
      if (response.ok) {
        const entry = await response.json()
        setExpenses(prev => [entry, ...prev])
        return entry
      } else {
        console.error('Failed to add expense:', await response.text())
        return null
      }
    } catch (err) {
      console.error('Error adding expense:', err)
      return null
    }
  }

  async function updateExpense(id, fields) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, userId }),
      })
      if (response.ok) {
        const updated = await response.json()
        setExpenses(prev => prev.map(e => (e.id === id ? updated : e)))
      } else {
        console.error('Failed to update expense:', await response.text())
      }
    } catch (err) {
      console.error('Error updating expense:', err)
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(`${API_URL}/${id}?userId=${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id))
      } else {
        console.error('Failed to delete expense:', await response.text())
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
    }
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense }
}
