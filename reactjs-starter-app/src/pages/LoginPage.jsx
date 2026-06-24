import React from "react";
// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Form, Button, Input, Typography, Switch, message } from 'antd';
import { MoonOutlined, SunOutlined, ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();

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

  const onFinishForgotPassword = async ({ identifier }) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      if (response.ok) {
        setResetEmailSent(true);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error occurred');
    }
    setLoading(false);
  };

  const goBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError('');
    loginForm.resetFields();
  };

  // ── Forgot Password View ──────────────────────────────────
  if (isForgotPassword) {
    return (
      <div className="login-container">
        {loading && <PageLoader fullScreen size={120} />}
        <div className="login-card">
          <div className="login-header">
            <img src="/traxpense-logo.png" alt="TraXpense Logo" className="login-logo" />
            <Title level={3} className="login-title">TraXpenses</Title>
          </div>

          {resetEmailSent ? (
            <div className="forgot-pw-success">
              <div className="forgot-pw-success-icon">
                <MailOutlined />
              </div>
              <Title level={4} style={{ margin: 0, textAlign: 'center' }}>Check Your Email</Title>
              <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 8, lineHeight: 1.6 }}>
                If an account with that information exists, we've sent a password reset link. Please check your inbox and spam folder.
              </Text>
              <Button
                type="primary"
                block
                style={{ marginTop: 24 }}
                onClick={goBackToLogin}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Forgot Password?</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: 6, lineHeight: 1.5 }}>
                  Enter your email or username and we'll send you a link to reset your password.
                </Text>
              </div>
              <Form form={forgotPasswordForm} layout="vertical" onFinish={onFinishForgotPassword} style={{ width: '100%' }}>
                <Form.Item
                  name="identifier"
                  label="Email or Username"
                  rules={[
                    { required: true, message: 'Please enter your email or username!' },
                  ]}
                >
                  <Input placeholder="Enter your email or username" />
                </Form.Item>

                {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

                <Form.Item>
                  <Button type="primary" htmlType="submit" disabled={loading} block>
                    Send Reset Link
                  </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                  <Link onClick={goBackToLogin}>
                    <ArrowLeftOutlined style={{ marginRight: 6 }} />
                    Back to Login
                  </Link>
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

  // ── Login / Register View ────────────────────────────────
  return (
    <div className="login-container">
      {loading && <PageLoader fullScreen size={120} />}
      <div className="login-card">
        <div className="login-header">
          <img src="/traxpense-logo.png" alt="TraXpense Logo" className="login-logo" />
          <Title level={3} className="login-title">TraXpenses</Title>
        </div>
        {!isRegistering ? (
          <Form key="login-form" form={loginForm} layout="vertical" onFinish={onFinishLogin} style={{ width: '100%' }}>
            <Form.Item name="username" label="Email or Username" rules={[{ required: true, message: 'Please input your Email or Username!' }]}>
              <Input placeholder="Email or Username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>

            <div className="forgot-pw-link-wrapper">
              <Link onClick={() => { setIsForgotPassword(true); setError(''); forgotPasswordForm.resetFields(); }}>
                Forgot Password?
              </Link>
            </div>

            {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={loading} block>
                Login
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Text>Don't have an account? </Text>
              <Link onClick={() => { setIsRegistering(true); setError(''); registerForm.resetFields(); loginForm.resetFields(); }}>Register</Link>
            </div>
          </Form>
        ) : (
          <Form key="register-form" form={registerForm} layout="vertical" onFinish={onFinishRegister} style={{ width: '100%' }} autoComplete="off">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Full Name" autoComplete="off" />
            </Form.Item>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="Username" autoComplete="off" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Email" autoComplete="off" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Password" autoComplete="new-password" />
            </Form.Item>

            {error && <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={loading} block>
                Register
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Text>Already have an account? </Text>
              <Link onClick={() => { setIsRegistering(false); setError(''); loginForm.resetFields(); }}>Login</Link>
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
