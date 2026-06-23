import React from "react";
// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Form, Button, Input, Typography, Switch, message } from 'antd';
import { MoonOutlined, SunOutlined, ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageLoader from '../components/PageLoader';
import emailjs from '@emailjs/browser';

const { Title, Text, Link } = Typography;

export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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

  const onFinishForgotPassword = async ({ email }) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        const data = await response.json().catch(() => null);
        console.log('Forgot password response:', data);
        // If reset data is returned, send email via EmailJS
        if (data?.resetData) {
          console.log('Sending email via EmailJS with data:', data.resetData);
          try {
            const result = await emailjs.send(
              'service_l3kdsag',
              'template_xkxfx3q',
              {
                to_name: data.resetData.userName,
                email: data.resetData.userEmail,
                link: data.resetData.resetLink,
              },
              'mU3oGmiLuMuV_ahZs'
            );
            console.log('EmailJS success:', result);
          } catch (emailErr) {
            console.error('EmailJS error:', emailErr);
            setError('Failed to send reset email. Please try again.');
            setLoading(false);
            return;
          }
        } else {
          console.log('No resetData in response — email may not exist');
        }
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
                If an account with that email exists, we've sent a password reset link. Please check your inbox and spam folder.
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
                  Enter your email address and we'll send you a link to reset your password.
                </Text>
              </div>
              <Form layout="vertical" onFinish={onFinishForgotPassword} style={{ width: '100%' }}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input placeholder="Enter your email" />
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
          <Form layout="vertical" onFinish={onFinishLogin} style={{ width: '100%' }}>
            <Form.Item name="username" label="Email or Username" rules={[{ required: true, message: 'Please input your Email or Username!' }]}>
              <Input placeholder="Email or Username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>

            <div className="forgot-pw-link-wrapper">
              <Link onClick={() => { setIsForgotPassword(true); setError(''); }}>
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
