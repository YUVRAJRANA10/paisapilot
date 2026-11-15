import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Settings() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [currency, setCurrency] = useState(user?.currency || 'INR')
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata')
  const save = async () => {
    await api.updatePreferences({ currency, timezone })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  return (
    <div className="space-y-6">
      <div><p className="text-label-sm uppercase tracking-wider text-primary">Workspace</p><h1 className="headline-lg text-on-surface font-semibold">Settings</h1><p className="body-md text-secondary">Manage your PaisaPilot account preferences.</p></div>
      <Card className="max-w-2xl"><h2 className="headline-md text-on-surface font-semibold">Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Currency</p>
              <p className="text-xs text-on-surface-variant">Indian Rupee (₹)</p>
            </div>
            <select value={currency} onChange={event => setCurrency(event.target.value)} className="bg-transparent border-none text-on-surface text-sm font-medium focus:outline-none" aria-label="Currency">
              <option>INR</option>
              <option>USD</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Timezone</p>
              <p className="text-xs text-on-surface-variant">Asia/Kolkata</p>
            </div>
            <select value={timezone} onChange={event => setTimezone(event.target.value)} className="bg-transparent border-none text-on-surface text-sm font-medium focus:outline-none" aria-label="Timezone">
              <option>Asia/Kolkata</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={save}>{saved ? <><Check size={15} /> Saved</> : 'Save preferences'}</Button></div>
        </div>
      </Card>
    </div>
  )
}