import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antTheme } from 'antd'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { AppLayout } from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { CurrencySetupModal } from './components/CurrencySetupModal'
import { useAuth } from './context/AuthContext'
import RupeeLoader from './components/RupeeLoader'

const BASE_TOKENS = {
  colorPrimary: '#0d9488',
  colorPrimaryHover: '#0f766e',
  colorPrimaryActive: '#115e59',
  colorLink: '#0d9488',
  borderRadius: 10,
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
}

function AppContent() {
  const { isDark } = useTheme()

  const configTheme = {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      ...BASE_TOKENS,
      ...(isDark
        ? {}
        : {
            colorBgBase: '#f0fdf9',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#f1faf7',
            colorBorder: '#d1fae5',
          }),
    },
    components: {
      Layout: {
        headerBg: isDark ? '#0d1720' : '#ffffff',
        siderBg: isDark ? '#0d1720' : '#ffffff',
        bodyBg: isDark ? '#0f1923' : '#f0fdf9',
        triggerBg: '#0d9488',
      },
      // In dark mode, override menu dark-item tokens
      ...(isDark
        ? {
            Menu: {
              darkItemBg: '#0d1720',
              darkItemSelectedBg: 'rgba(13,148,136,0.18)',
              darkItemHoverBg: 'rgba(13,148,136,0.1)',
              darkItemColor: '#94a3b8',
              darkItemSelectedColor: '#2dd4bf',
              darkSubMenuItemBg: '#0d1720',
            },
          }
        : {
            Menu: {
              itemSelectedBg: 'rgba(13,148,136,0.12)',
              itemSelectedColor: '#0d9488',
              itemHoverBg: 'rgba(13,148,136,0.06)',
              itemHoverColor: '#0d9488',
            },
          }),
      Pagination: {
        itemActiveBg: '#0d9488',
        itemActiveColorDisabled: 'rgba(255, 255, 255, 0.25)',
      },
    },
  }

  // Injecting active item color globally via css for antd pagination as a fallback
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .ant-pagination-item-active a {
        color: #ffffff !important;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <ConfigProvider theme={configTheme} spin={{ indicator: <RupeeLoader size={36} /> }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CurrencySetupGate />
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ConfigProvider>
  )
}

/** Shows the currency setup modal when user has no default currency saved. */
function CurrencySetupGate() {
  const { user } = useAuth()
  const needsSetup = user && !user.defaultCurrency
  return <CurrencySetupModal open={!!needsSetup} />
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
