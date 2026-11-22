import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { realAdapter } from '../services/realAdapter'
import { useAuth } from '../context/AuthContext'

const initialCategories = [
  { name: 'Food & Dining', color: '#ef4444', budget: '' },
  { name: 'Transport', color: '#3b82f6', budget: '' },
  { name: 'Bills & Utilities', color: '#f59e0b', budget: '' },
  { name: 'Shopping', color: '#8b5cf6', budget: '' },
]

export default function Onboarding() {
  const [categories, setCategories] = useState(initialCategories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const month = new Date().toISOString().slice(0, 7)

  const update = (index, field, value) => {
    setCategories(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const skip = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await realAdapter.updatePreferences({ onboardingCompleted: true })
      setUser(result.preferences)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not finish setup.')
    } finally {
      setLoading(false)
    }
  }

  const finish = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const existing = await realAdapter.getCategories()
      for (const item of categories.filter(category => category.name.trim())) {
        const name = item.name.trim()
        let category = existing.categories.find(value => value.name.toLowerCase() === name.toLowerCase())
        if (!category) {
          const created = await realAdapter.createCategory({
            name,
            color: item.color,
          })
          category = created.category
        }
        if (item.budget) {
          await realAdapter.updateBudget(category.id, {
            month,
            limitPaise: Math.round(Number(item.budget) * 100),
          })
        }
      }
      const result = await realAdapter.updatePreferences({ onboardingCompleted: true })
      setUser(result.preferences)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not save your setup.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <Card className="mx-auto max-w-2xl">
        <p className="text-label-sm uppercase tracking-wider text-primary">Personal setup</p>
        <h1 className="mt-2 text-3xl font-semibold text-on-surface">Set up your money plan</h1>
        <p className="mt-2 text-secondary">Welcome {user?.name}. Choose the categories you want to track and an optional budget for this month.</p>
        <form onSubmit={finish} className="mt-8 space-y-5">
          {error && <div className="rounded-lg bg-error-container p-3 text-error">{error}</div>}
          {categories.map((category, index) => (
            <div key={category.name} className="grid gap-3 rounded-lg border border-outline/30 p-4 sm:grid-cols-2">
              <Input label={`Category ${index + 1}`} value={category.name} onChange={event => update(index, 'name', event.target.value)} />
              <Input label="Monthly budget (optional)" type="number" min="0" step="0.01" value={category.budget} onChange={event => update(index, 'budget', event.target.value)} placeholder="10000" />
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={skip}>Skip for now</Button>
            <Button type="submit" loading={loading}>Save setup</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
