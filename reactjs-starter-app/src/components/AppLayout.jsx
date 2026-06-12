import { useState } from 'react'
import { Layout, Menu, Avatar, Typography, Button, Dropdown, Switch, Divider } from 'antd'
import {
  DashboardOutlined,
  WalletOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  AccountBookFilled,
  LogoutOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const SIDER_WIDTH = 220
const SIDER_COLLAPSED_WIDTH = 64

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = location.pathname.replace('/', '') || 'dashboard'

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'expenses', icon: <WalletOutlined />, label: 'Expenses' },
  ]

  const dropdownItems = [
    {
      key: 'user-info',
      label: (
        <div className="avatar-popover-user" style={{ padding: '8px 4px' }}>
          <Avatar icon={<UserOutlined />} size={36} className="popover-avatar-sm" />
          <div>
            <Text className="popover-username">{user?.name || 'User'}</Text>
            <Text className="popover-role">Administrator</Text>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'theme-toggle',
      label: (
        <div className="theme-toggle-row" style={{ padding: '4px' }} onClick={e => e.stopPropagation()}>
          <div className="theme-toggle-label">
            {isDark ? (
              <MoonOutlined className="theme-mode-icon dark" />
            ) : (
              <SunOutlined className="theme-mode-icon light" />
            )}
            <Text className="theme-mode-text">{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </div>
          <Switch
            size="small"
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            className="theme-switch"
          />
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: <Text type="danger">Logout</Text>,
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        className="app-sider"
      >
        <div className="sider-logo" style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '20px 0 16px' : '20px 16px 16px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(c => !c)}
            className="collapse-btn"
            style={{ padding: 0 }}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
          className="sider-menu"
          theme={isDark ? 'dark' : 'light'}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH,
          transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* ── Fixed Header ── */}
        <Header className="app-header">
          <div className="header-left">
            <div className="header-logo">
              <AccountBookFilled className="logo-icon-header" />
              <Text className="header-brand">TraXpenses</Text>
            </div>
          </div>

          <div className="header-right">
            <Dropdown
              menu={{
                items: dropdownItems,
                onClick: ({ key }) => {
                  if (key === 'logout') logout()
                },
              }}
              trigger={['click']}
              placement="bottomRight"
              open={avatarPopoverOpen}
              onOpenChange={setAvatarPopoverOpen}
              overlayClassName="avatar-dropdown-overlay"
            >
              <Avatar
                icon={<UserOutlined />}
                className="user-avatar"
                size={38}
              />
            </Dropdown>
          </div>
        </Header>

        {/* ── Page Content ── */}
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
