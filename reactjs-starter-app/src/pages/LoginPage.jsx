// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Form, Button, Select, Input, Typography, Switch } from 'antd';
import { AccountBookFilled, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onFinish = ({ username, password }) => {
    setLoading(true);
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <AccountBookFilled className="login-logo" />
          <Title level={3} className="login-title">TraXpenses</Title>
        </div>
        <Form layout="vertical" onFinish={onFinish} style={{ width: '100%' }}>
          <Form.Item name="username" label="Username" initialValue="Arjav" rules={[{ required: true }]}>
            <Select placeholder="Select user">
              <Option value="Arjav">Arjav</Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          {error && <Text type="danger">{error}</Text>}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
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
