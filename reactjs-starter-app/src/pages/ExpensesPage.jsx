import { useState, useMemo } from 'react'
import { Typography, Button, Select, message, Upload } from 'antd'
import { PlusOutlined, FilterOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../context/AuthContext'
import { ExpenseModal } from '../components/ExpenseModal'
import { ExpenseList } from '../components/ExpenseList'

const { Title, Text } = Typography

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

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
  const { user } = useAuth()
  const { expenses, loading, addExpense, updateExpense, deleteExpense, importExpense } = useExpenses(user?.id)
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

  const grandTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  }, [filteredExpenses])

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

  async function handleSave(fields) {
    if (modalMode === 'add') {
      const result = await addExpense(fields)
      if (result) {
        messageApi.success('Expense added successfully!')
      } else {
        messageApi.error('Failed to add expense. Please try again.')
        return
      }
    } else {
      await updateExpense(selectedExpense.id, fields)
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
        <Title level={2} className="greeting-title">{getGreeting()}, {user?.name || user?.username || 'User'}</Title>
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
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={async (file) => {
            const hide = messageApi.loading('Importing receipt...', 0);
            const result = await importExpense(file);
            hide();
            if (result && result.length > 0) {
              messageApi.success(`Successfully imported ${result.length} transaction(s)!`);
            } else if (result && result.length === 0) {
              messageApi.warning('No new transactions found (all duplicates or nothing extracted).');
            } else {
              messageApi.error('Failed to import receipt. Please try again.');
            }
            return false; // Prevent default antd upload behavior
          }}
        >
          <Button icon={<UploadOutlined />} size="large" className="import-expense-btn">
            Import Receipt
          </Button>
        </Upload>

        <div className="action-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="grand-total" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Total: ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={MONTHS}
            className="month-filter"
            size="large"
          />
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={availableYears}
            className="year-filter"
            size="large"
          />
        </div>
      </div>

      {/* Expense List */}
      <ExpenseList expenses={filteredExpenses} loading={loading} onRowClick={openEditModal} />

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
