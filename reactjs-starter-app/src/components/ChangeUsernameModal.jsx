import React from "react";
import { useEffect, useMemo, useState } from 'react'
import { Modal, Form, Input, Alert } from 'antd'
import dayjs from 'dayjs'

function getDaysUntilUsernameChange(usernameChangedAt) {
  if (!usernameChangedAt) return 0
  const nextAllowed = dayjs(usernameChangedAt).add(14, 'day')
  const daysRemaining = nextAllowed.diff(dayjs(), 'day')
  return daysRemaining > 0 ? daysRemaining : 0
}

export function ChangeUsernameModal({ open, user, onSave, onCancel }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState(user?.username || '')

  const daysRemaining = useMemo(
    () => getDaysUntilUsernameChange(user?.usernameChangedAt),
    [user?.usernameChangedAt]
  )
  const isOnCooldown = daysRemaining > 0

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ username: user?.username || '' })
      setInputValue(user?.username || '')
      setError('')
    }
  }, [open, user?.username, form])

  async function handleOk() {
    if (isOnCooldown) return

    try {
      const values = await form.validateFields()
      setLoading(true)
      setError('')
      const result = await onSave(values.username.trim())
      if (!result.success) {
        setError(result.error || 'Failed to update username')
      }
    } catch {
      // validation errors are handled by the form
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Change Username"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Save"
      confirmLoading={loading}
      okButtonProps={{ disabled: isOnCooldown || inputValue.trim() === (user?.username || '') }}
      destroyOnClose
    >
      {isOnCooldown && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`You can change your username again in ${daysRemaining} day(s).`}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={error}
        />
      )}

      <Form 
        form={form} 
        layout="vertical"
        onValuesChange={(changedValues) => {
          if ('username' in changedValues) {
            setInputValue(changedValues.username || '')
          }
        }}
      >
        <Form.Item
          name="username"
          label="New Username"
          rules={[
            { required: true, message: 'Please enter a username' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { max: 30, message: 'Username must be at most 30 characters' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' },
          ]}
        >
          <Input placeholder="Enter new username" disabled={isOnCooldown} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
