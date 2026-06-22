// src/components/CurrencySetupModal.jsx
import { useState } from 'react'
import { Modal, Select, Button, Typography } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { CURRENCIES } from '../utils/currencies'
import { useCurrency } from '../context/CurrencyContext'

const { Title, Text } = Typography

const CURRENCY_OPTIONS = CURRENCIES.map(c => ({
  value: c.code,
  label: (
    <div className="currency-option">
      <span className="currency-flag">{c.flag}</span>
      <span className="currency-name">{c.name}</span>
      <span className="currency-symbol-badge">{c.symbol}</span>
    </div>
  ),
  // For search filtering
  searchText: `${c.code} ${c.name} ${c.symbol}`.toLowerCase(),
}))

/**
 * CurrencySetupModal — shown to new users (or users with no defaultCurrency)
 * immediately after landing on the dashboard. Non-dismissable without picking.
 */
export function CurrencySetupModal({ open }) {
  const { updateCurrency } = useCurrency()
  const [selected, setSelected] = useState('INR')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await updateCurrency(selected)
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      footer={null}
      centered
      width={480}
      className="currency-setup-modal"
    >
      <div className="currency-setup-content">
        <div className="currency-setup-icon">
          <GlobalOutlined />
        </div>
        <Title level={3} className="currency-setup-title">
          Choose your default currency
        </Title>
        <Text className="currency-setup-sub">
          All your dashboard totals and analytics will be displayed in this currency.
          You can change it anytime from your settings.
        </Text>

        <Select
          className="currency-setup-select"
          value={selected}
          onChange={setSelected}
          options={CURRENCY_OPTIONS}
          showSearch
          filterOption={(input, option) =>
            option.searchText.includes(input.toLowerCase())
          }
          size="large"
          style={{ width: '100%', marginTop: 24 }}
          popupClassName="currency-dropdown-popup"
        />

        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleConfirm}
          style={{ marginTop: 20 }}
          className="currency-confirm-btn"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
