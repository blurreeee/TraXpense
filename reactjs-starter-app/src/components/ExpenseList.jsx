import { useState, useMemo } from 'react'
import { List, Pagination, Empty, Typography, Tooltip } from 'antd'
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
 *   onRowClick  {(expense) => void}
 */
export function ExpenseList({ expenses, onRowClick }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [amountSortOrder, setAmountSortOrder] = useState('default')
  const [dateSortOrder, setDateSortOrder] = useState('desc') // Default sort by date

  const sortedExpenses = useMemo(() => {
    let result = [...expenses]

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
  }, [expenses, amountSortOrder, dateSortOrder])

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

  const listHeader = (
    <div className="expense-item-inner expense-list-header">
      <div className="expense-col expense-col-index">Sr. No.</div>
      <div className="expense-col">Category</div>
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

  if (totalItems === 0) {
    return (
      <div className="empty-state">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text className="empty-text">No expenses added yet.</Text>}
        />
      </div>
    )
  }

  return (
    <div className="expense-list-wrapper">
      <List
        header={listHeader}
        dataSource={pageItems}
        renderItem={(item, index) => {
          const cat = CATEGORY_CONFIG[item.description] || CATEGORY_CONFIG.Misc
          const { Icon } = cat
          const globalIndex = startIdx + index + 1
          const amountClass = getAmountTierClass(Number(item.amount))

          const tooltipContent = item.note ? (
            <div className="expense-note-tooltip-content">
              <FileTextOutlined style={{ marginRight: 6 }} />
              {item.note}
            </div>
          ) : null

          return (
            <Tooltip
              key={item.id}
              title={tooltipContent}
              placement="top"
              color="black"
              overlayClassName="expense-note-tooltip"
              mouseEnterDelay={0.15}
              mouseLeaveDelay={0.05}
            >
              <List.Item
                className="expense-list-item"
                onClick={() => onRowClick(item)}
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
                      <FileTextOutlined className="note-indicator" title={item.note} />
                    )}
                  </div>
                </div>
              </List.Item>
            </Tooltip>
          )
        }}
        className="expense-list"
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
