import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, Lock, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card padded={false} className="w-full max-w-md shadow-elevated border border-outline/30">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              PP
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">Paisa<span className="text-primary">Pilot</span></h1>
              <p className="text-sm text-secondary">Apne paison ke pilot khud baniye.</p>
            </div>
          </div>

          <h2 className="headline-lg text-headline-lg text-on-surface font-semibold mb-2">Create account</h2>
          <p className="body-md text-body-md text-secondary mb-6">Join PaisaPilot and take control of your finances</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error-container border border-error/20 text-error text-body-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Aditi Sharma"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="name@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <Select
              label="Timezone"
              options={[
                { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                { value: 'Asia/Mumbai', label: 'India (Mumbai)' },
                { value: 'Asia/Delhi', label: 'India (Delhi)' },
                { value: 'Asia/Chennai', label: 'India (Chennai)' },
                { value: 'Asia/Bangalore', label: 'India (Bangalore)' },
              ]}
              value={form.timezone}
              onChange={v => setForm(prev => ({ ...prev, timezone: v }))}
              placeholder="Select timezone"
            />
            <Select
              label="Currency"
              options={[
                { value: 'INR', label: 'Indian Rupee (₹)' },
                { value: 'USD', label: 'US Dollar ($)' },
              ]}
              value={form.currency}
              onChange={v => setForm(prev => ({ ...prev, currency: v }))}
              placeholder="Select currency"
            />

            <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
              Create account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-outline/30">
            <p className="text-label-sm text-on-surface-variant">Already have an account?</p>
            <Link to="/login" className="mt-2 inline-block text-sm text-primary hover:text-primary-container">
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}