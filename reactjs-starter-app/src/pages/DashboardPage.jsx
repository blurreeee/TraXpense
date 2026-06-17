import { useState, useMemo } from 'react'
import { Typography, Select, Button } from 'antd'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../hooks/useExpenses'

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

const CustomTooltip = ({ active, payload, label, coordinate, mousePos, requireExactHover }) => {
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
        <div className="tooltip-value">₹{payload[0].value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
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
  const { expenses } = useExpenses(user?.id)

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

  const donutData = useMemo(() => {
    const filtered = expenses.filter(
      e => e.date && dayjs(e.date).format('MM') === donutMonth && dayjs(e.date).format('YYYY') === donutYear
    )
    const grouped = {}
    filtered.forEach(e => {
      const cat = e.description || 'Misc'
      grouped[cat] = (grouped[cat] || 0) + Number(e.amount)
    })
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [expenses, donutMonth, donutYear])

  const totalDonutSpent = useMemo(() => donutData.reduce((sum, item) => sum + item.value, 0), [donutData])

  const lineData = useMemo(() => {
    const filtered = expenses.filter(e => e.date && dayjs(e.date).format('YYYY') === lineYear)
    const monthlyTotals = {}
    MONTHS.forEach(m => monthlyTotals[m.label.substring(0, 3)] = 0)
    
    filtered.forEach(e => {
      const monthLabel = dayjs(e.date).format('MMM')
      monthlyTotals[monthLabel] = (monthlyTotals[monthLabel] || 0) + Number(e.amount)
    })

    return MONTHS.map((m, index) => {
      const monthVal = m.label.substring(0, 3)
      const isFuture = lineYear === currentYear && index > parseInt(currentMonth, 10) - 1
      return {
        month: monthVal,
        total: isFuture ? null : monthlyTotals[monthVal]
      }
    })
  }, [expenses, lineYear, currentYear, currentMonth])

  return (
    <div className="dashboard-page">
      <div className="dashboard-banner">
        <div className="dashboard-banner-content">
          <div className="dashboard-banner-text">
            <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
              {getGreeting()}, {user?.name || user?.username || 'User'}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>Insights and analytics for every rupee</Text>
          </div>
          <Button size="large" className="track-now-btn" onClick={() => navigate('/expenses')}>
            Track now
          </Button>
        </div>
      </div>

      <div className="dashboard-charts-container">
        {/* Donut Chart Section */}
        <div className="chart-card donut-card">
          <div className="chart-header">
            <Text strong style={{ fontSize: '1.1rem' }}>Monthly breakdown</Text>
            <div className="chart-filters">
              <Select value={donutMonth} onChange={setDonutMonth} options={MONTHS} size="small" className="chart-select" />
              <Select value={donutYear} onChange={setDonutYear} options={availableYears} size="small" className="chart-select" style={{ marginLeft: 8 }} />
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
                    content={<CustomTooltip />} 
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
                <div className="donut-total-amount">₹{totalDonutSpent.toLocaleString('en-IN')}</div>
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
            <Select value={lineYear} onChange={setLineYear} options={availableYears} size="small" className="chart-select" />
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
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000) + 'k' : value}`} 
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
                  <div className="tooltip-value">₹{hoveredLineNode.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
