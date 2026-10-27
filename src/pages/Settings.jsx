import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useDemoMode } from '../context/DemoContext'

export default function Settings() {
  const { resetDemoData, demoMode, toggleDemoMode } = useDemoMode()
  const [saved, setSaved] = useState(false)
  const [currency, setCurrency] = useState(() => localStorage.getItem('paisapilot_currency') || 'INR')
  const [timezone, setTimezone] = useState(() => localStorage.getItem('paisapilot_timezone') || 'Asia/Kolkata')
  const save = () => {
    localStorage.setItem('paisapilot_currency', currency)
    localStorage.setItem('paisapilot_timezone', timezone)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  return (
    <div className="space-y-6">
      <div><p className="text-label-sm uppercase tracking-wider text-primary">Workspace</p><h1 className="headline-lg text-on-surface font-semibold">Settings</h1><p className="body-md text-secondary">Manage preferences for your PaisaPilot demo workspace.</p></div>
      <Card className="max-w-2xl"><h2 className="headline-md text-on-surface font-semibold">Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline/30">
            <div>
              <p className="text-label-sm text-label-sm text-on-surface font-medium">Demo Mode</p>
              <p className="text-xs text-on-surface-variant">Using demonstration data. Reset to start fresh.</p>
            </div>
            <Button variant="secondary" onClick={resetDemoData}><RotateCcw size={15} /> Reset</Button>
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
          <div className="mt-5 flex items-center justify-between border-t border-outline/30 pt-5">
            <div><p className="font-medium">Demo mode</p><p className="text-xs text-secondary">Use local demonstration records while presenting.</p></div>
            <button type="button" onClick={toggleDemoMode} aria-pressed={demoMode} className={`h-6 w-11 rounded-full p-1 transition-colors ${demoMode ? 'bg-primary' : 'bg-outline-variant'}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${demoMode ? 'translate-x-5' : ''}`} /></button>
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={save}>{saved ? <><Check size={15} /> Saved</> : 'Save preferences'}</Button></div>
        </div>
      </Card>
    </div>
  )
}