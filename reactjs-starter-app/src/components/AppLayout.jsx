import { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Typography, Button, Dropdown, Switch } from 'antd'
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = location.pathname.replace('/', '') || 'dashboard'

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname, isMobile])

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
      {/* ── Mobile Backdrop ── */}
      {isMobile && mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={isMobile ? false : collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={SIDER_WIDTH}
        collapsedWidth={isMobile ? SIDER_WIDTH : SIDER_COLLAPSED_WIDTH}
        className={`app-sider${isMobile ? (mobileOpen ? ' mobile-open' : ' mobile-hidden') : ''}`}
      >
        <div className="sider-logo" style={{ justifyContent: collapsed && !isMobile ? 'center' : 'space-between', padding: collapsed && !isMobile ? '20px 0 16px' : '20px 16px 16px' }}>
          <Button
            type="text"
            icon={collapsed && !isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) setMobileOpen(false)
              else setCollapsed(c => !c)
            }}
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
          marginLeft: isMobile ? 0 : (collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH),
          transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* ── Fixed Header ── */}
        <Header className="app-header">
          <div className="header-left">
            {/* Mobile hamburger */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileOpen(true)}
                className="collapse-btn mobile-hamburger"
                style={{ padding: 0, marginRight: 8 }}
              />
            )}
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
