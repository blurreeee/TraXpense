import { useState, useMemo } from 'react'
import { Typography, Button, Select, Space, message } from 'antd'
import { PlusOutlined, FilterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useExpenses } from '../hooks/useExpenses'
import { ExpenseModal } from '../components/ExpenseModal'
import { ExpenseList } from '../components/ExpenseList'

const { Title, Text } = Typography

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  const availableYears = useMemo(() => {
    const years = new Set(expenses.map(e => (e.date ? dayjs(e.date).format('YYYY') : null)).filter(Boolean))
    return [{ value: '', label: 'All Years' }, ...Array.from(years).sort().reverse().map(y => ({ value: y, label: y }))]
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    let result = expenses
    if (selectedMonth) {
      result = result.filter(e => e.date && dayjs(e.date).format('MM') === selectedMonth)
    }
    if (selectedYear) {
      result = result.filter(e => e.date && dayjs(e.date).format('YYYY') === selectedYear)
    }
    return result
  }, [expenses, selectedMonth, selectedYear])

  function openAddModal() {
    setModalMode('add')
    setSelectedExpense(null)
    setModalOpen(true)
  }

  function openEditModal(expense) {
    setModalMode('edit')
    setSelectedExpense(expense)
    setModalOpen(true)
  }

  function handleSave(fields) {
    if (modalMode === 'add') {
      addExpense(fields)
      messageApi.success('Expense added successfully!')
    } else {
      updateExpense(selectedExpense.id, fields)
      messageApi.success('Expense updated!')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    deleteExpense(selectedExpense.id)
    messageApi.success('Expense deleted.')
    setModalOpen(false)
  }

  return (
    <div className="expenses-page">
      {contextHolder}

      {/* Greeting */}
      <div className="greeting-section">
        <Title level={2} className="greeting-title">Greetings, User</Title>
        <Text className="greeting-sub">Manage and track your expenses below</Text>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          size="large"
          className="add-expense-btn"
        >
          Add Expense
        </Button>

        <div className="action-bar-right">
          <FilterOutlined className="filter-icon" />
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={MONTHS}
            style={{ width: 140 }}
            size="large"
            className="month-filter"
          />
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={availableYears}
            style={{ width: 120 }}
            size="large"
            className="year-filter"
          />
        </div>
      </div>

      {/* Expense List */}
      <ExpenseList expenses={filteredExpenses} onRowClick={openEditModal} />

      {/* Add / Edit Modal */}
      <ExpenseModal
        open={modalOpen}
        mode={modalMode}
        expense={selectedExpense}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  )
}
