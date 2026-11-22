import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export function AuthRequiredRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />
}

export function SetupRequiredRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.onboardingCompleted) return <Navigate to="/onboarding" replace />
  return children
}

export function OnboardingRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return children
}