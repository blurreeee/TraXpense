// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Form, Button, Input, Typography, Switch } from 'antd';
import { AccountBookFilled, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageLoader from '../components/PageLoader';

const { Title, Text, Link } = Typography;

export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinishLogin = async ({ username, password }) => {
    setLoading(true);
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    setError('');
    const result = await register(values);
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {loading && <PageLoader fullScreen size={120} />}
      <div className="login-card">
        <div className="login-header">
          <img src="/traxpense-logo.png" alt="TraXpense Logo" className="login-logo" />
          <Title level={3} className="login-title">TraXpenses</Title>
        </div>
        {!isRegistering ? (
          <Form layout="vertical" onFinish={onFinishLogin} style={{ width: '100%' }}>
            <Form.Item name="username" label="Email or Username" rules={[{ required: true, message: 'Please input your Email or Username!' }]}>
              <Input placeholder="Email or Username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>

            {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={loading} block>
                Login
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Text>Don't have an account? </Text>
              <Link onClick={() => { setIsRegistering(true); setError(''); }}>Register</Link>
            </div>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={onFinishRegister} style={{ width: '100%' }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Full Name" />
            </Form.Item>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>

            {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={loading} block>
                Register
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Text>Already have an account? </Text>
              <Link onClick={() => { setIsRegistering(false); setError(''); }}>Login</Link>
            </div>
          </Form>
        )}
        <div className="theme-toggle-wrapper">
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            className="theme-switch"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
