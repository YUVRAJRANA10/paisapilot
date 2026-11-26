import { useEffect, useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { cn } from '../../utils/cn'
import { TRANSACTION_TYPES, PAYMENT_MODES, RECURRENCE_FREQUENCIES } from '../../utils/constants'
import { parseINRString } from '../../utils/format'
import { transactionSchema } from '../../utils/validation'
import { demoAdapter } from '../../services/demoAdapter'

const getDefaultDateTime = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function TransactionForm({ isOpen, onClose, onSave, transaction = null }) {
  const [categories, setCategories] = useState([])
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    date: getDefaultDateTime(),
    paymentMode: 'UPI',
    note: '',
    isRecurring: false,
    recurrence: {
      frequency: 'monthly',
      interval: 1,
    },
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isOpen) return
    demoAdapter.getCategories().then(res => {
      setCategories(res.categories || [])
    })
    setForm({
      type: transaction?.type || 'expense',
      amount: transaction ? String(transaction.amount / 100) : '',
      categoryId: transaction?.categoryId || '',
      date: transaction?.date ? transaction.date.slice(0, 16) : getDefaultDateTime(),
      paymentMode: transaction?.paymentMode || 'UPI',
      note: transaction?.note || '',
      isRecurring: transaction?.isRecurring || false,
      recurrence: transaction?.recurrence || { frequency: 'monthly', interval: 1 },
    })
    setIsAddingCustom(false)
    setCustomCategoryName('')
    setErrors({})
  }, [isOpen, transaction])

  const handleTypeChange = (type) => {
    setForm(prev => ({ ...prev, type }))
  }

  const handleCreateCustomCategory = async () => {
    const trimmed = customCategoryName.trim()
    if (!trimmed) return
    setIsCreatingCategory(true)
    try {
      const res = await demoAdapter.createCategory({ name: trimmed })
      if (res?.category) {
        setCategories(prev => {
          if (prev.some(c => c.id === res.category.id)) return prev
          return [...prev, res.category]
        })
        setForm(prev => ({ ...prev, categoryId: res.category.id }))
        setIsAddingCustom(false)
        setCustomCategoryName('')
        setErrors(prev => ({ ...prev, categoryId: undefined }))
      }
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let currentCategoryId = form.categoryId
    if (isAddingCustom && customCategoryName.trim()) {
      try {
        const res = await demoAdapter.createCategory({ name: customCategoryName.trim() })
        if (res?.category) {
          currentCategoryId = res.category.id
          setCategories(prev => [...prev, res.category])
          setForm(prev => ({ ...prev, categoryId: res.category.id }))
          setIsAddingCustom(false)
          setCustomCategoryName('')
        }
      } catch (err) {}
    }

    const newErrors = {}
    if (!form.type) newErrors.type = 'Type is required'
    if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim()) || parseINRString(form.amount) <= 0) {
      newErrors.amount = 'Enter a positive amount with up to two decimals'
    }
    if (!currentCategoryId) newErrors.categoryId = 'Category is required'
    if (!form.date || Number.isNaN(new Date(form.date).getTime())) newErrors.date = 'Valid date is required'
    if (!form.paymentMode) newErrors.paymentMode = 'Payment mode is required'

    const payload = {
      id: transaction?.id,
      type: form.type,
      amount: parseINRString(form.amount),
      categoryId: currentCategoryId,
      date: form.date,
      paymentMode: form.paymentMode,
      note: form.note.trim(),
      isRecurring: form.isRecurring,
      recurrence: form.isRecurring ? form.recurrence : undefined,
    }
    const validation = transactionSchema.safeParse(payload)
    if (!validation.success) {
      validation.error.issues.forEach(issue => {
        newErrors[issue.path[0]] = issue.message
      })
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSave(payload)
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

        {isAddingCustom ? (
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              New Category Name
            </label>
            <div className="flex gap-2">
              <Input
                value={customCategoryName}
                onChange={e => setCustomCategoryName(e.target.value)}
                placeholder="e.g. Subscriptions, Books..."
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleCreateCustomCategory}
                disabled={!customCategoryName.trim() || isCreatingCategory}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAddingCustom(false)
                  setCustomCategoryName('')
                }}
              >
                Cancel
              </Button>
            </div>
            {errors.categoryId && <span className="text-error text-label-sm">{errors.categoryId}</span>}
          </div>
        ) : (
          <Select
            label="Category"
            options={[
              ...categories.map(c => ({ value: c.id, label: c.name })),
              { value: '__custom__', label: '+ Add custom category...' },
            ]}
            value={form.categoryId}
            onChange={v => {
              if (v === '__custom__') {
                setIsAddingCustom(true)
              } else {
                setForm(prev => ({ ...prev, categoryId: v }))
                setErrors(prev => ({ ...prev, categoryId: undefined }))
              }
            }}
            placeholder="Select category"
            error={errors.categoryId}
          />
        )}

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