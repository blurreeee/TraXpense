import { Typography } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-empty">
        <div className="dashboard-icon">
          <BarChartOutlined />
        </div>
        <Title level={3} className="dashboard-title">Dashboard</Title>
        <Text className="dashboard-sub">Analytics and insights coming soon...</Text>
      </div>
    </div>
  )
}
