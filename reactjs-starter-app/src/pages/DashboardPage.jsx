import React from "react";
import { useState, useMemo } from 'react'
import { Typography, Select, Button } from 'antd'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { useExpenses } from '../hooks/useExpenses'
import PageLoader from '../components/PageLoader'
import CurrencyParticles from '../components/CurrencyParticles'

const { Title, Text } = Typography

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Utilities: '#f59e0b',
  Travel: '#ef4444',
  Luxury: '#8b5cf6',
  Misc: '#6b7280',
}

const MONTHS = [
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

const CustomTooltip = ({ active, payload, label, coordinate, mousePos, requireExactHover, currencySymbol }) => {
  if (active && payload && payload.length) {
    if (requireExactHover && mousePos) {
      const dx = mousePos.x - mousePos.activeX;
      const dy = mousePos.y - mousePos.activeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (isNaN(dist) || dist > 25) {
        return null;
      }
    }

    const isBottomHalf = coordinate?.y > 140;
    return (
      <div className={`custom-tooltip ${isBottomHalf ? 'tooltip-below' : 'tooltip-above'}`}>
        <div className="tooltip-label">{label || payload[0].name}</div>
        <div className="tooltip-value">{currencySymbol}{payload[0].value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
      </div>
    )
  }
  return null
}

const CustomDot = (props) => {
  const { cx, cy, payload, value, setHoveredLineNode } = props;
  const [isHovered, setIsHovered] = useState(false);

  if (value === null) return null;

  return (
    <g
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onMouseEnter={() => {
        setIsHovered(true);
        setHoveredLineNode({ active: true, payload, value, cx, cy });
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredLineNode(null);
      }}
    >
      <circle cx={cx} cy={cy} r={20} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 7 : 5}
        fill="#10b981"
        stroke="#fff"
        strokeWidth={2}
        style={{ transition: 'all 0.2s ease' }}
      />
    </g>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const { expenses, loading } = useExpenses(user?.id)
  const { convertToDefault, ratesLoading } = useExchangeRates(currency.code)

  const currentMonth = dayjs().format('MM')
  const currentYear = dayjs().format('YYYY')

  const [donutMonth, setDonutMonth] = useState(currentMonth)
  const [donutYear, setDonutYear] = useState(currentYear)
  const [lineYear, setLineYear] = useState(currentYear)

  const [donutMousePos, setDonutMousePos] = useState(undefined)
  const [hoveredLineNode, setHoveredLineNode] = useState(null)

  const availableYears = useMemo(() => {
    const years = new Set(expenses.map(e => (e.date ? dayjs(e.date).format('YYYY') : null)).filter(Boolean))
    years.add(currentYear)
    return Array.from(years).sort().reverse().map(y => ({ value: y, label: y }))
  }, [expenses, currentYear])

  /** Convert a single expense amount to the default currency. */
  const toDefault = (e) => convertToDefault(Number(e.amount), e.currency || 'INR')

  const donutData = useMemo(() => {
    const filtered = expenses.filter(
      e => e.date && dayjs(e.date).format('MM') === donutMonth && dayjs(e.date).format('YYYY') === donutYear
    )
    const grouped = {}
    filtered.forEach(e => {
      const cat = e.description || 'Misc'
      const converted = toDefault(e)
      if (converted !== null) {
        grouped[cat] = (grouped[cat] || 0) + converted
      }
    })
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [expenses, donutMonth, donutYear, convertToDefault])

  const totalDonutSpent = useMemo(() => donutData.reduce((sum, item) => sum + item.value, 0), [donutData])

  const lineData = useMemo(() => {
    const filtered = expenses.filter(e => e.date && dayjs(e.date).format('YYYY') === lineYear)
    const monthlyTotals = {}
    MONTHS.forEach(m => monthlyTotals[m.label.substring(0, 3)] = 0)

    filtered.forEach(e => {
      const monthLabel = dayjs(e.date).format('MMM')
      const converted = toDefault(e)
      if (converted !== null) {
        monthlyTotals[monthLabel] = (monthlyTotals[monthLabel] || 0) + converted
      }
    })

    return MONTHS.map((m, index) => {
      const monthVal = m.label.substring(0, 3)
      const isFuture = lineYear === currentYear && index > parseInt(currentMonth, 10) - 1
      return {
        month: monthVal,
        total: isFuture ? null : monthlyTotals[monthVal]
      }
    })
  }, [expenses, lineYear, currentYear, currentMonth, convertToDefault])

  const stats = useMemo(() => {
    if (!expenses || !expenses.length) return null;

    const monthlyData = {};
    let maxExpense = null;
    let maxExpenseConverted = -Infinity;

    expenses.forEach(e => {
      const amt = Number(e.amount);
      const convertedAmt = convertToDefault(amt, e.currency || 'INR');
      if (convertedAmt === null) return;

      if (convertedAmt > maxExpenseConverted) {
        maxExpenseConverted = convertedAmt;
        maxExpense = { ...e, convertedAmount: convertedAmt };
      }

      if (e.date) {
        const d = dayjs(e.date);
        const monthYear = d.format('MM-YYYY');
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            amount: 0,
            count: 0,
            label: d.format('MMM YYYY'),
            rawMonth: d.format('MM'),
            rawYear: d.format('YYYY')
          };
        }
        monthlyData[monthYear].amount += convertedAmt;
        monthlyData[monthYear].count += 1;
      }
    });

    const months = Object.values(monthlyData);
    if (!months.length) return null;

    months.sort((a, b) => b.amount - a.amount);
    const mostExpensiveMonth = months[0];
    const leastExpensiveMonth = months[months.length - 1];

    months.sort((a, b) => b.count - a.count);
    const mostTransactionsMonth = months[0];

    return {
      mostExpensiveMonth,
      leastExpensiveMonth,
      mostTransactionsMonth,
      maxExpense
    };
  }, [expenses, convertToDefault]);

  const handleCardClick = (type) => {
    if (!stats) return;

    let stateParams = {};

    switch(type) {
      case 'mostExpensive':
        if (!stats.mostExpensiveMonth) return;
        stateParams = { filterMonth: stats.mostExpensiveMonth.rawMonth, filterYear: stats.mostExpensiveMonth.rawYear, sortAmount: 'desc', sortDate: 'default' };
        break;
      case 'leastExpensive':
        if (!stats.leastExpensiveMonth) return;
        stateParams = { filterMonth: stats.leastExpensiveMonth.rawMonth, filterYear: stats.leastExpensiveMonth.rawYear, sortAmount: 'asc', sortDate: 'default' };
        break;
      case 'mostTransactions':
        if (!stats.mostTransactionsMonth) return;
        stateParams = { filterMonth: stats.mostTransactionsMonth.rawMonth, filterYear: stats.mostTransactionsMonth.rawYear, sortAmount: 'default', sortDate: 'desc' };
        break;
      case 'largestExpense':
        if (!stats.maxExpense || !stats.maxExpense.date) return;
        const d = dayjs(stats.maxExpense.date);
        stateParams = { filterMonth: d.format('MM'), filterYear: d.format('YYYY'), sortAmount: 'desc', sortDate: 'default' };
        break;
      default:
        return;
    }
    navigate('/expenses', { state: stateParams });
  }

  /** Format an amount with the default currency symbol. */
  const fmt = (val) =>
    `${currency.symbol}${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-top-section">
        <div className="dashboard-banner">
          <CurrencyParticles />
          <div className="dashboard-banner-content">
            <div className="dashboard-banner-text">
              <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
                {getGreeting()}, {user?.name || user?.username || 'User'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                Insights and analytics in {currency.name}
              </Text>
            </div>
            <Button size="large" className="track-now-btn" onClick={() => navigate('/expenses')}>
              Track now
            </Button>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card" onClick={() => handleCardClick('mostExpensive')}>
            <div className="stat-title">Most Expensive Month</div>
            <div className="stat-value">{ratesLoading ? '—' : fmt(stats?.mostExpensiveMonth?.amount)}</div>
            <div className="stat-desc">{stats?.mostExpensiveMonth?.label || '-'}</div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick('leastExpensive')}>
            <div className="stat-title">Least Expensive Month</div>
            <div className="stat-value">{ratesLoading ? '—' : fmt(stats?.leastExpensiveMonth?.amount)}</div>
            <div className="stat-desc">{stats?.leastExpensiveMonth?.label || '-'}</div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick('mostTransactions')}>
            <div className="stat-title">Most Transactions</div>
            <div className="stat-value">{stats?.mostTransactionsMonth?.count || 0}</div>
            <div className="stat-desc">{stats?.mostTransactionsMonth?.label || '-'}</div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick('largestExpense')}>
            <div className="stat-title">Largest Expense</div>
            <div className="stat-value">{ratesLoading ? '—' : fmt(stats?.maxExpense?.convertedAmount)}</div>
            <div className="stat-desc">{stats?.maxExpense?.date ? dayjs(stats.maxExpense.date).format('DD MMM YYYY') : '-'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-container">
        {/* Donut Chart Section */}
        <div className="chart-card donut-card">
          <div className="chart-header">
            <Text strong style={{ fontSize: '1.1rem' }}>Monthly breakdown</Text>
            <div className="chart-filters">
              <Select value={donutMonth} onChange={setDonutMonth} options={MONTHS} size="small" className="chart-select month-chart-select" popupClassName="chart-select-popup" />
              <Select value={donutYear} onChange={setDonutYear} options={availableYears} size="small" className="chart-select" popupClassName="chart-select-popup" style={{ marginLeft: 8 }} />
            </div>
          </div>
          <div className="donut-chart-wrapper">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart
                  onMouseMove={(e) => {
                    if (e && e.chartX != null && e.chartY != null) setDonutMousePos({ x: e.chartX, y: e.chartY })
                  }}
                  onMouseLeave={() => setDonutMousePos(undefined)}
                >
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Misc} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<CustomTooltip currencySymbol={currency.symbol} />}
                    position={donutMousePos}
                    isAnimationActive={false}
                    offset={0}
                    wrapperStyle={{ pointerEvents: 'none', zIndex: 100 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No data for this month</div>
            )}
            {donutData.length > 0 && (
              <div className="donut-total">
                <div className="donut-total-amount">{currency.symbol}{totalDonutSpent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
                <div className="donut-total-label">total spent</div>
              </div>
            )}
          </div>
          {donutData.length > 0 && (
            <div className="donut-legend">
              {donutData.map((entry) => (
                <div key={entry.name} className="legend-item">
                  <div className="legend-color-wrap">
                    <div className="legend-color" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Misc }}></div>
                    <span className="legend-name">{entry.name}</span>
                  </div>
                  <span className="legend-percent">{((entry.value / totalDonutSpent) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Line Chart Section */}
        <div className="chart-card line-chart-card">
          <div className="chart-header">
            <Text strong style={{ fontSize: '1.1rem' }}>Monthly expenses</Text>
            <Select value={lineYear} onChange={setLineYear} options={availableYears} size="small" className="chart-select" popupClassName="chart-select-popup" />
          </div>
          <div
            className="line-chart-wrapper"
            style={{ marginTop: 24, position: 'relative' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  dy={10}
                />
                <YAxis
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(value) => `${currency.symbol}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  width={70}
                  dx={-5}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={3}
                  connectNulls={false}
                  activeDot={false}
                  dot={<CustomDot setHoveredLineNode={setHoveredLineNode} />}
                />
              </LineChart>
            </ResponsiveContainer>

            {hoveredLineNode && (
              <div
                style={{
                  position: 'absolute',
                  left: hoveredLineNode.cx,
                  top: hoveredLineNode.cy,
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              >
                <div className={`custom-tooltip ${hoveredLineNode.cy > 140 ? 'tooltip-below' : 'tooltip-above'}`}>
                  <div className="tooltip-label">{hoveredLineNode.payload.month}</div>
                  <div className="tooltip-value">{currency.symbol}{hoveredLineNode.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
