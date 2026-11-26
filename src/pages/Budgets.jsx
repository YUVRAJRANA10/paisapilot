import { useEffect, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, Pencil, Plus, Target, X } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { realAdapter } from '../services/realAdapter'
import { calculatePercentage, formatINR } from '../utils/format'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)
const CURRENT_MONTH_LABEL = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editLimit, setEditLimit] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalCategory, setModalCategory] = useState('')
  const [modalLimit, setModalLimit] = useState('')
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadBudgets = () => {
    realAdapter.getBudgets({ month: CURRENT_MONTH }).then(result => {
      setBudgets(result.budgets || [])
    })
  }

  const loadCategories = () => {
    realAdapter.getCategories().then(result => {
      setCategories(result.categories || [])
    })
  }

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  const handleSaveInline = async (budget) => {
    const limitRupees = parseFloat(editLimit) || 0
    const limitPaise = Math.max(0, Math.round(limitRupees * 100))
    setSaving(true)
    try {
      await realAdapter.updateBudget(budget.categoryId, {
        limitPaise,
        month: CURRENT_MONTH,
      })
      loadBudgets()
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCustomCategory = async () => {
    const trimmed = customCategoryName.trim()
    if (!trimmed) return
    setIsCreatingCategory(true)
    try {
      const res = await realAdapter.createCategory({ name: trimmed })
      if (res?.category) {
        setCategories(prev => {
          if (prev.some(c => c.id === res.category.id)) return prev
          return [...prev, res.category]
        })
        setModalCategory(res.category.id)
        setIsAddingCustom(false)
        setCustomCategoryName('')
      }
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleModalSave = async (e) => {
    e.preventDefault()
    let catId = modalCategory
    if (isAddingCustom && customCategoryName.trim()) {
      try {
        const res = await realAdapter.createCategory({ name: customCategoryName.trim() })
        if (res?.category) {
          catId = res.category.id
          setCategories(prev => [...prev, res.category])
          setIsAddingCustom(false)
          setCustomCategoryName('')
        }
      } catch (err) {}
    }
    if (!catId) return
    const limitRupees = parseFloat(modalLimit) || 0
    const limitPaise = Math.max(0, Math.round(limitRupees * 100))

    setSaving(true)
    try {
      await realAdapter.updateBudget(catId, {
        limitPaise,
        month: CURRENT_MONTH,
      })
      loadBudgets()
      setIsModalOpen(false)
      setModalCategory('')
      setModalLimit('')
      setIsAddingCustom(false)
      setCustomCategoryName('')
    } finally {
      setSaving(false)
    }
  }

  const totalLimit = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0)
  const totalUsed = budgets.reduce((sum, budget) => sum + (budget.used || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-wider text-primary">Control center</p>
          <h1 className="headline-lg text-on-surface font-semibold">Monthly budgets</h1>
          <p className="body-md text-secondary">Keep category spending aligned with your {CURRENT_MONTH_LABEL} plan.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Configure Budget
        </Button>
      </div>

      <Card className="bg-inverse-surface text-inverse-on-surface">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-inverse-on-surface/70">Total allocated</p>
            <p className="mt-1 text-3xl font-bold">{formatINR(totalLimit)}</p>
          </div>
          <div>
            <p className="text-sm text-inverse-on-surface/70">Used this month</p>
            <p className="mt-1 text-3xl font-bold text-primary-fixed">{formatINR(totalUsed)}</p>
          </div>
          <div className="min-w-48">
            <div className="mb-2 flex justify-between text-xs text-inverse-on-surface/70">
              <span>Overall utilization</span><span>{totalLimit ? Math.round(totalUsed / totalLimit * 100) : 0}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary-fixed" style={{ width: `${Math.min(100, totalLimit ? totalUsed / totalLimit * 100 : 0)}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map(budget => {
          const percentage = calculatePercentage(budget.used, budget.limit)
          const over = budget.used > budget.limit
          const isEditing = editingId === budget.id

          return (
            <Card key={budget.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Target size={18} /></div>
                  <div>
                    <h2 className="font-semibold text-on-surface">{budget.categoryName}</h2>
                    <p className="text-xs text-secondary">Monthly allocation</p>
                  </div>
                </div>
                <Badge variant={over ? 'warning' : 'neutral'}>{over ? 'Over budget' : `${Math.round(percentage)}%`}</Badge>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{formatINR(budget.used)} spent</span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-secondary font-medium">of ₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={editLimit}
                        onChange={e => setEditLimit(e.target.value)}
                        className="w-24 px-1.5 py-0.5 text-sm bg-surface border border-primary rounded text-on-surface font-medium focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveInline(budget)}
                        disabled={saving}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Save limit"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-secondary hover:bg-surface-container-high rounded"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-secondary font-medium">of {formatINR(budget.limit)}</span>
                      <button
                        onClick={() => {
                          setEditingId(budget.id)
                          setEditLimit(String(budget.limit / 100))
                        }}
                        className="p-1 text-secondary hover:text-primary hover:bg-surface-container-high rounded transition-colors"
                        title="Edit limit"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-error' : percentage >= 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min(100, percentage)}%` }} />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
                  {over ? (
                    <>
                      <AlertTriangle size={14} className="text-error" />
                      <span className="text-error font-medium">{formatINR(budget.used - budget.limit)} over limit</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>{formatINR(budget.limit - budget.used)} remaining</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Category Budget"
      >
        <form onSubmit={handleModalSave} className="p-6 space-y-4">
          {isAddingCustom ? (
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                New Category Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={customCategoryName}
                  onChange={e => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Subscriptions, Groceries..."
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
            </div>
          ) : (
            <Select
              label="Category"
              value={modalCategory}
              onChange={v => {
                if (v === '__custom__') {
                  setIsAddingCustom(true)
                } else {
                  setModalCategory(v)
                }
              }}
              options={[
                ...categories.map(c => ({ value: c.id, label: c.name })),
                { value: '__custom__', label: '+ Add custom category...' },
              ]}
              placeholder="Select a category"
              required
            />
          )}

          <Input
            label="Monthly Limit (₹)"
            type="number"
            min="0"
            step="100"
            value={modalLimit}
            onChange={e => setModalLimit(e.target.value)}
            placeholder="e.g. 5000"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/30">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
