import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [currency, setCurrency] = useState(user?.currency || 'INR')
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata')
  const [monthlyIncome, setMonthlyIncome] = useState(
    user?.monthlyIncomePaise ? String(user.monthlyIncomePaise / 100) : ''
  )

  const save = async () => {
    const payload = {
      currency,
      timezone,
      monthlyIncomePaise: monthlyIncome ? Math.round(Number(monthlyIncome) * 100) : 0,
    }
    const result = await api.updatePreferences(payload)
    if (result?.preferences) {
      setUser(result.preferences)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-sm uppercase tracking-wider text-primary">Workspace</p>
        <h1 className="headline-lg text-on-surface font-semibold">Settings</h1>
        <p className="body-md text-secondary">Manage your PaisaPilot account preferences.</p>
      </div>

      <Card className="max-w-2xl">
        <h2 className="headline-md text-on-surface font-semibold mb-4">Preferences</h2>

        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <label className="block text-label-sm text-on-surface font-medium mb-1">
              Expected Monthly Salary / Income (₹)
            </label>
            <p className="text-xs text-on-surface-variant mb-2">
              Your baseline monthly earnings used for budgeting and cash flow targets.
            </p>
            <input
              type="number"
              min="0"
              step="100"
              value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)}
              placeholder="e.g. 85000"
              className="w-full bg-surface border border-outline/40 rounded-lg px-3 py-2 text-on-surface text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-on-surface font-medium">Currency</p>
              <p className="text-xs text-on-surface-variant">Indian Rupee (₹)</p>
            </div>
            <select
              value={currency}
              onChange={event => setCurrency(event.target.value)}
              className="bg-surface border border-outline/40 rounded-lg px-3 py-1.5 text-on-surface text-sm font-medium focus:outline-none"
              aria-label="Currency"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-on-surface font-medium">Timezone</p>
              <p className="text-xs text-on-surface-variant">Asia/Kolkata</p>
            </div>
            <select
              value={timezone}
              onChange={event => setTimezone(event.target.value)}
              className="bg-surface border border-outline/40 rounded-lg px-3 py-1.5 text-on-surface text-sm font-medium focus:outline-none"
              aria-label="Timezone"
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={save}>
              {saved ? <><Check size={15} /> Saved</> : 'Save preferences'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
