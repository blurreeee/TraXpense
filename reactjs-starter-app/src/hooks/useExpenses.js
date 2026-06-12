import { useState, useEffect } from 'react'

const API_URL = '/api/expenses'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    try {
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.sort((a, b) => b.id - a.id))
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
    }
  }

  async function addExpense(expenseData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      })
      if (response.ok) {
        const entry = await response.json()
        setExpenses(prev => [entry, ...prev])
        return entry
      } else {
        console.error('Failed to add expense:', await response.text())
      }
    } catch (err) {
      console.error('Error adding expense:', err)
    }
  }

  async function updateExpense(id, fields) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
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
      const response = await fetch(`${API_URL}/${id}`, {
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

  return { expenses, addExpense, updateExpense, deleteExpense }
}
