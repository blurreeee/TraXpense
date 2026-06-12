import { useEffect } from 'react'
import {
  Modal,
  Form,
  DatePicker,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
} from 'antd'
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  EditOutlined,
  CoffeeOutlined,
  ThunderboltOutlined,
  CarOutlined,
  CrownOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

const CATEGORY_ICON_MAP = {
  Food: <CoffeeOutlined />,
  Utilities: <ThunderboltOutlined />,
  Travel: <CarOutlined />,
  Luxury: <CrownOutlined />,
  Misc: <AppstoreOutlined />,
}

const EXPENSE_CATEGORIES = Object.entries(CATEGORY_ICON_MAP).map(([value, icon]) => ({
  value,
  label: (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}
      {value}
    </span>
  ),
}))

/**
 * ExpenseModal — shared Add / Edit modal.
 *
 * Props:
 *   open       {boolean}
 *   mode       {'add' | 'edit'}
 *   expense    {object|null}
 *   onSave     {(fields) => void}
 *   onDelete   {() => void}
 *   onCancel   {() => void}
 */
export function ExpenseModal({ open, mode, expense, onSave, onDelete, onCancel }) {
  const [form] = Form.useForm()
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open) {
      if (isEdit && expense) {
        form.setFieldsValue({
          date: expense.date ? dayjs(expense.date) : null,
          description: expense.description,
          amount: expense.amount,
          note: expense.note || '',
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, isEdit, expense, form])

  async function handleSave() {
    try {
      const values = await form.validateFields()
      onSave({
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        description: values.description,
        amount: values.amount,
        note: values.note?.trim() || '',
      })
    } catch {
      // validation error — Ant Design shows inline messages
    }
  }

  const modalTitle = (
    <span className="modal-title-inner">
      {isEdit ? <EditOutlined /> : <PlusCircleOutlined />}
      <span style={{ marginLeft: 8 }}>{isEdit ? 'Edit Expense' : 'Add New Expense'}</span>
    </span>
  )

  const footer = (
    <div className="modal-footer">
      {isEdit && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onDelete}
        >
          Delete
        </Button>
      )}
      <Space className="modal-footer-actions">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          icon={isEdit ? <SaveOutlined /> : <PlusCircleOutlined />}
          onClick={handleSave}
        >
          {isEdit ? 'Save Changes' : 'Add Expense'}
        </Button>
      </Space>
    </div>
  )

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onCancel}
      footer={footer}
      destroyOnClose
      className="expense-modal"
      width={460}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="expense-form"
      >
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD MMM YYYY"
            placeholder="Select date"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Select expense category"
            options={EXPENSE_CATEGORIES}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (₹)"
          rules={[
            { required: true, message: 'Please enter an amount' },
            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            precision={2}
            placeholder="0.00"
            prefix="₹"
          />
        </Form.Item>

        <Form.Item
          name="note"
          label="Note (optional)"
        >
          <TextArea
            placeholder="Add a note or description for this expense..."
            rows={3}
            maxLength={200}
            showCount
            className="expense-note-input"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// Export category config so ExpenseList can reuse it
export { CATEGORY_ICON_MAP }
