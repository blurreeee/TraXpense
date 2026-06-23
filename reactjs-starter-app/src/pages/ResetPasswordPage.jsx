// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Form, Button, Input, Typography, Switch } from 'antd';
import { MoonOutlined, SunOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import PageLoader from '../components/PageLoader';

const { Title, Text, Link } = Typography;

export function ResetPasswordPage() {
  const { isDark, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const onFinish = async ({ newPassword }) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data?.message || 'Failed to reset password. The link may have expired.');
      }
    } catch {
      setError('Network error occurred');
    }
    setLoading(false);
  };

  // No token in URL — invalid access
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/traxpense-logo.png" alt="TraXpense Logo" className="login-logo" />
            <Title level={3} className="login-title">TraXpenses</Title>
          </div>
          <div className="forgot-pw-success">
            <div className="forgot-pw-success-icon error">
              <CloseCircleOutlined />
            </div>
            <Title level={4} style={{ margin: 0, textAlign: 'center' }}>Invalid Reset Link</Title>
            <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 8, lineHeight: 1.6 }}>
              This password reset link is invalid or has expired. Please request a new one.
            </Text>
            <Button
              type="primary"
              block
              style={{ marginTop: 24 }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </div>
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

  return (
    <div className="login-container">
      {loading && <PageLoader fullScreen size={120} />}
      <div className="login-card">
        <div className="login-header">
          <img src="/traxpense-logo.png" alt="TraXpense Logo" className="login-logo" />
          <Title level={3} className="login-title">TraXpenses</Title>
        </div>

        {success ? (
          <div className="forgot-pw-success">
            <div className="forgot-pw-success-icon">
              <CheckCircleOutlined />
            </div>
            <Title level={4} style={{ margin: 0, textAlign: 'center' }}>Password Reset!</Title>
            <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 8, lineHeight: 1.6 }}>
              Your password has been changed successfully. You can now log in with your new password.
            </Text>
            <Button
              type="primary"
              block
              style={{ marginTop: 24 }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ margin: 0 }}>Reset Your Password</Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 6, lineHeight: 1.5 }}>
                Enter your new password below. Make sure it's at least 6 characters.
              </Text>
            </div>
            <Form layout="vertical" onFinish={onFinish} style={{ width: '100%' }}>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>

              {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={loading} block>
                  Reset Password
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center' }}>
                <Link onClick={() => navigate('/login')}>Back to Login</Link>
              </div>
            </Form>
          </>
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

export default ResetPasswordPage;
