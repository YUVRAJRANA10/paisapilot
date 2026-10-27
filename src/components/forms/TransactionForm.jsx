import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import { TRANSACTION_TYPES, PAYMENT_MODES, CATEGORIES_DEMO, RECURRENCE_FREQUENCIES } from '../../utils/constants'
import { parseINRString } from '../../utils/format'

export function TransactionForm({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().slice(0, 16),
    paymentMode: 'UPI',
    note: '',
    isRecurring: false,
    recurrence: {
      frequency: 'monthly',
      interval: 1,
    },
  })
  const [errors, setErrors] = useState({})

  const handleTypeChange = (type) => {
    setForm(prev => ({ ...prev, type }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.type) newErrors.type = 'Type is required'
    if (!form.amount || parseINRString(form.amount) <= 0) newErrors.amount = 'Valid amount required'
    if (!form.categoryId) newErrors.categoryId = 'Category is required'
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.paymentMode) newErrors.paymentMode = 'Payment mode is required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const amountPaise = parseINRString(form.amount)
    const category = CATEGORIES_DEMO.find(c => c.id === form.categoryId)

    onSave({
      type: form.type,
      amount: amountPaise,
      categoryId: form.categoryId,
      date: form.date,
      paymentMode: form.paymentMode,
      note: form.note,
      isRecurring: form.isRecurring,
      recurrence: form.isRecurring ? form.recurrence : undefined,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {TRANSACTION_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors font-medium text-sm',
                form.type === t.value
                  ? t.value === 'income'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <Plus size={18} />
              {t.label}
            </button>
          ))}
        </div>

        <Input
          label="Amount (₹)"
          value={form.amount}
          onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
          prefix="₹"
          error={errors.amount}
          placeholder="0.00"
        />

        <Select
          label="Category"
          options={CATEGORIES_DEMO
            .filter(c => c.budgetLimit > 0 || form.type === 'income')
            .map(c => ({ value: c.id, label: c.name }))}
          value={form.categoryId}
          onChange={v => setForm(prev => ({ ...prev, categoryId: v }))}
          placeholder="Select category"
          error={errors.categoryId}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="datetime-local"
            value={form.date}
            onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
            error={errors.date}
          />

          <Select
            label="Payment Mode"
            options={PAYMENT_MODES.map(m => ({ value: m, label: m }))}
            value={form.paymentMode}
            onChange={v => setForm(prev => ({ ...prev, paymentMode: v }))}
            error={errors.paymentMode}
          />
        </div>

        <Input
          label="Notes (optional)"
          value={form.note}
          onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
          placeholder="e.g. Grocery shopping, team lunch"
        />

        <div className="flex items-center gap-3 pt-2">
          <input
            id="is-recurring"
            type="checkbox"
            checked={form.isRecurring}
            onChange={e => setForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest"
          />
          <label htmlFor="is-recurring" className="text-label-sm text-label-sm text-on-surface cursor-pointer">
            Recurring transaction
          </label>
        </div>

        {form.isRecurring && (
          <div className="bg-surface-container-low rounded-lg p-3 border border-outline/30">
            <Select
              label="Frequency"
              options={RECURRENCE_FREQUENCIES.map(f => ({ value: f.value, label: f.label }))}
              value={form.recurrence.frequency}
              onChange={v => setForm(prev => ({ ...prev, recurrence: { ...prev.recurrence, frequency: v } }))}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
          >
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  )
}