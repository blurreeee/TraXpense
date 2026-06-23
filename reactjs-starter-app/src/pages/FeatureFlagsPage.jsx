import React from 'react'
import { Card, Table, Switch, Typography, Spin } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useFeatureFlagAdmin } from '../context/FeatureFlagContext'

const { Title, Text } = Typography

export function FeatureFlagsPage() {
  const { flags, loading, toggleFlag } = useFeatureFlagAdmin()

  const data = Object.entries(flags).map(([key, enabled]) => ({
    key,
    enabled
  }))

  const columns = [
    {
      title: 'Feature Key',
      dataIndex: 'key',
      key: 'key',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Switch 
          checked={enabled} 
          onChange={(checked) => toggleFlag(record.key, checked)} 
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <SettingOutlined style={{ fontSize: 28, color: '#0d9488' }} />
        <Title level={2} style={{ margin: 0 }}>Feature Flags Admin</Title>
      </div>
      
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={data} 
            pagination={false} 
            rowKey="key"
          />
        )}
      </Card>
    </div>
  )
}
