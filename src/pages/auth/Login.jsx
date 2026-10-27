import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useDemoMode } from '../../context/DemoContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { demoMode, resetDemoData } = useDemoMode()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Simulate auth delay
      await new Promise(r => setTimeout(r, 800))
      // Demo: accept any credentials
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
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

          <h2 className="headline-lg text-headline-lg text-on-surface font-semibold mb-2">Welcome back</h2>
          <p className="body-md text-body-md text-secondary mb-6">Sign in to access your financial dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              error={error}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-label-sm text-on-surface-variant">
                <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary" />
                Remember me
              </label>
              <Link to="#" className="text-sm text-primary hover:text-primary-container">Forgot password?</Link>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-outline/30">
            <p className="text-label-sm text-on-surface-variant mb-4">Don't have an account?</p>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/register')}>
              Create account
            </Button>
          </div>

          {demoMode && (
            <div className="mt-6 pt-4 border-t border-outline/30 bg-surface-container-low/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Demo Mode</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Using demonstration data. No real bank accounts or UPI services are connected.
              </p>
              <button
                onClick={resetDemoData}
                className="mt-3 text-xs text-primary hover:text-primary-container underline"
              >
                Reset demo data
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}