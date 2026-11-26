import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const [saved, setSaved] = useState(false)
  const [fullName, setFullName] = useState(() => {
    return user?.user_metadata?.full_name || user?.full_name || user?.name || ''
  })
  const [currency, setCurrency] = useState(() => localStorage.getItem('paisapilot_currency') || 'INR')
  const [timezone, setTimezone] = useState(() => localStorage.getItem('paisapilot_timezone') || 'Asia/Kolkata')

  const save = () => {
    localStorage.setItem('paisapilot_currency', currency)
    localStorage.setItem('paisapilot_timezone', timezone)
    if (fullName && updateProfile) {
      updateProfile({
        name: fullName,
        full_name: fullName,
        user_metadata: { full_name: fullName },
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-sm uppercase tracking-wider text-primary">Account</p>
        <h1 className="headline-lg text-on-surface font-semibold">Settings</h1>
        <p className="body-md text-secondary">Manage your profile and account preferences.</p>
      </div>
      <Card className="max-w-2xl">
        <h2 className="headline-md text-on-surface font-semibold mb-4">Profile & Preferences</h2>

        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <label className="block text-label-sm text-on-surface font-medium mb-1">Full Name / Username</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 bg-surface-container-lowest border border-outline/30 rounded-lg text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Email</p>
              <p className="text-xs text-on-surface-variant">{user?.email || 'Not provided'}</p>
            </div>
          </div>

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