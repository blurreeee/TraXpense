import { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Typography, Button, Dropdown, Switch, message } from 'antd'
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
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { ChangeUsernameModal } from './ChangeUsernameModal'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const SIDER_WIDTH = 220
const SIDER_COLLAPSED_WIDTH = 64

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [avatarPopoverOpen, setAvatarPopoverOpen] = useState(false)
  const [usernameModalOpen, setUsernameModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { user, logout, updateUsername } = useAuth()
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

  const openUsernameModal = () => {
    setAvatarPopoverOpen(false)
    setUsernameModalOpen(true)
  }

  const handleUsernameSave = async (newUsername) => {
    const result = await updateUsername(newUsername)
    if (result.success) {
      message.success('Username updated successfully')
      setUsernameModalOpen(false)
    }
    return result
  }

  const dropdownItems = [
    {
      key: 'user-info',
      label: (
        <div
          className="avatar-popover-user username-clickable"
          title="Click to change username"
        >
          <Avatar size={36} className="popover-avatar-sm" style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}>
            {getInitials(user?.name)}
          </Avatar>
          <div>
            <Text className="popover-username">{user?.name || 'User'}</Text>
            <Text className="popover-role">@{user?.username || 'user'}</Text>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'theme-toggle',
      label: (
        <div className="theme-toggle-row" style={{ padding: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
          <div className="theme-toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDark ? (
              <MoonOutlined className="theme-mode-icon dark" />
            ) : (
              <SunOutlined className="theme-mode-icon light" />
            )}
            <Text className="theme-mode-text">{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              size="small"
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              className="theme-switch"
            />
          </div>
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
        <div className="sider-toggle-arrow" onClick={() => {
          if (isMobile) setMobileOpen(!mobileOpen)
          else setCollapsed(!collapsed)
        }}>
          {isMobile ? (mobileOpen ? <LeftOutlined /> : <RightOutlined />) : (collapsed ? <RightOutlined /> : <LeftOutlined />)}
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
              <img src="/traxpense-logo.png" alt="TraXpense Logo" style={{ width: 88, height: 88, objectFit: 'contain', filter: 'drop-shadow(0 0 4px var(--primary))' }} />
              <Text className="header-brand">TraXpenses</Text>
            </div>
          </div>

          <div className="header-right">
            <Dropdown
              menu={{
                items: dropdownItems,
                onClick: ({ key }) => {
                  if (key === 'user-info') openUsernameModal()
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
                className="user-avatar"
                size={38}
                style={{ backgroundColor: '#1890ff', verticalAlign: 'middle', color: 'white' }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        {/* ── Page Content ── */}
        <Content className="app-content">{children}</Content>
      </Layout>

      <ChangeUsernameModal
        open={usernameModalOpen}
        user={user}
        onSave={handleUsernameSave}
        onCancel={() => setUsernameModalOpen(false)}
      />
    </Layout>
  )
}
