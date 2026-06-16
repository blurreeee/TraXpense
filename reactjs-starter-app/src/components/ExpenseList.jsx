import { useState, useMemo, useRef } from 'react'
import { List, Pagination, Empty, Typography, Dropdown } from 'antd'
import {
  CalendarOutlined,
  FileTextOutlined,
  CoffeeOutlined,
  ThunderboltOutlined,
  CarOutlined,
  CrownOutlined,
  AppstoreOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography

const PAGE_SIZE = 10

/** Category visual config — icons from Ant Design, no emojis */
const CATEGORY_CONFIG = {
  Food: { Icon: CoffeeOutlined, color: '#059669', bg: 'rgba(5,150,105,0.12)' },
  Utilities: { Icon: ThunderboltOutlined, color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  Travel: { Icon: CarOutlined, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  Luxury: { Icon: CrownOutlined, color: '#db2777', bg: 'rgba(219,39,119,0.12)' },
  Misc: { Icon: AppstoreOutlined, color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
}

/**
 * Returns a CSS class name for the amount value tier.
 * Tiers (₹): ≤500 → tier-1 | 501–1000 → tier-2 | 1001–5000 → tier-3 | 5000+ → tier-4
 * Actual colours are defined in index.css via CSS variables, switching per theme.
 */
function getAmountTierClass(amount) {
  if (amount <= 500) return 'amount-tier-1'
  if (amount <= 1000) return 'amount-tier-2'
  if (amount <= 5000) return 'amount-tier-3'
  return 'amount-tier-4'
}

/**
 * ExpenseList — paginated list of expense entries.
 *
 * Props:
 *   expenses    {Array}
 *   loading     {boolean}
 *   onRowClick  {(expense) => void}
 */
export function ExpenseList({ expenses, loading, onRowClick }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [amountSortOrder, setAmountSortOrder] = useState('default')
  const [dateSortOrder, setDateSortOrder] = useState('desc') // Default sort by date
  const [selectedCategory, setSelectedCategory] = useState('All')

  const tooltipRef = useRef(null)

  const sortedExpenses = useMemo(() => {
    let result = [...expenses]

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.description === selectedCategory)
    }

    if (amountSortOrder !== 'default') {
      result.sort((a, b) => {
        if (amountSortOrder === 'asc') return Number(a.amount) - Number(b.amount)
        return Number(b.amount) - Number(a.amount)
      })
    } else if (dateSortOrder !== 'default') {
      result.sort((a, b) => {
        const dateA = a.date ? dayjs(a.date).valueOf() : 0
        const dateB = b.date ? dayjs(b.date).valueOf() : 0
        if (dateSortOrder === 'asc') return dateA - dateB
        return dateB - dateA
      })
    }

    return result
  }, [expenses, amountSortOrder, dateSortOrder, selectedCategory])

  const totalItems = sortedExpenses.length
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const pageItems = sortedExpenses.slice(startIdx, startIdx + PAGE_SIZE)

  const toggleAmountSort = () => {
    setDateSortOrder('default')
    if (amountSortOrder === 'default') setAmountSortOrder('asc')
    else if (amountSortOrder === 'asc') setAmountSortOrder('desc')
    else setAmountSortOrder('default')
  }

  const toggleDateSort = () => {
    setAmountSortOrder('default')
    if (dateSortOrder === 'default') setDateSortOrder('asc')
    else if (dateSortOrder === 'asc') setDateSortOrder('desc')
    else setDateSortOrder('default')
  }

  const categoryItems = [
    { key: 'All', label: 'All Categories' },
    ...Object.keys(CATEGORY_CONFIG).map(cat => ({ key: cat, label: cat }))
  ]

  const onCategoryMenuClick = (e) => {
    setSelectedCategory(e.key)
    setCurrentPage(1)
  }

  const handleMouseMove = (e, note) => {
    if (!note || !tooltipRef.current) return
    tooltipRef.current.style.opacity = '1'
    tooltipRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`
    const textSpan = tooltipRef.current.querySelector('.tooltip-text')
    if (textSpan && textSpan.textContent !== note) {
      textSpan.textContent = note
    }
  }

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0'
      tooltipRef.current.style.transform = `translate(-9999px, -9999px)`
    }
  }

  const listHeader = (
    <div className="expense-item-inner expense-list-header">
      <div className="expense-col expense-col-index">Sr. No.</div>
      <Dropdown
        menu={{ items: categoryItems, onClick: onCategoryMenuClick }}
        trigger={['click']}
      >
        <div className="expense-col expense-col-sortable" style={{ cursor: 'pointer' }}>
          Category
          <div className="sort-icons">
            <DownOutlined style={{ color: selectedCategory !== 'All' ? 'var(--primary)' : 'var(--text-muted)' }} />
          </div>
        </div>
      </Dropdown>
      <div
        className="expense-col expense-col-sortable"
        onClick={toggleDateSort}
      >
        Date
        <div className="sort-icons">
          <UpOutlined style={{ color: dateSortOrder === 'asc' ? 'var(--primary)' : 'var(--text-muted)' }} />
          <DownOutlined style={{ color: dateSortOrder === 'desc' ? 'var(--primary)' : 'var(--text-muted)' }} />
        </div>
      </div>
      <div
        className="expense-col expense-col-sortable expense-col-amount"
        onClick={toggleAmountSort}
      >
        Amount
        <div className="sort-icons">
          <UpOutlined style={{ color: amountSortOrder === 'asc' ? 'var(--primary)' : 'var(--text-muted)' }} />
          <DownOutlined style={{ color: amountSortOrder === 'desc' ? 'var(--primary)' : 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="expense-list-wrapper">
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.15s ease',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '6px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translate(-9999px, -9999px)',
          whiteSpace: 'nowrap'
        }}
      >
        <FileTextOutlined />
        <span className="tooltip-text"></span>
      </div>

      <List
        loading={loading}
        header={listHeader}
        dataSource={pageItems}
        renderItem={(item, index) => {
          const cat = CATEGORY_CONFIG[item.description] || CATEGORY_CONFIG.Misc
          const { Icon } = cat
          const globalIndex = startIdx + index + 1
          const amountClass = getAmountTierClass(Number(item.amount))

          return (
            <List.Item
              key={item.id}
              className="expense-list-item"
              onClick={() => onRowClick(item)}
              onMouseMove={(e) => handleMouseMove(e, item.note)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer' }}
            >
              <div className="expense-item-inner">
                <div className="expense-col expense-col-index">
                  <div className="expense-index">{globalIndex}</div>
                </div>

                <div className="expense-col">
                  <div
                    className="expense-category-badge"
                    style={{
                      background: cat.bg,
                      color: cat.color,
                      border: `1px solid ${cat.color}35`,
                    }}
                  >
                    <Icon style={{ fontSize: 13 }} />
                    <span className="badge-label">{item.description}</span>
                  </div>
                </div>

                <div className="expense-col expense-meta">
                  <CalendarOutlined className="meta-icon" />
                  <Text className="meta-text">
                    {item.date ? dayjs(item.date).format('DD MMM YYYY') : '—'}
                  </Text>
                </div>

                <div className="expense-col expense-col-amount">
                  <div className={`expense-amount ${amountClass}`}>
                    ₹{Number(item.amount).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  {item.note && (
                    <FileTextOutlined className="note-indicator" />
                  )}
                </div>
              </div>
            </List.Item>
          )
        }}
        className="expense-list"
        locale={{
          emptyText: (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Text className="empty-text">No expenses found.</Text>}
              />
            </div>
          )
        }}
      />

      {totalItems > PAGE_SIZE && (
        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={PAGE_SIZE}
            onChange={page => setCurrentPage(page)}
            showTotal={total => `${total} expenses`}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}
