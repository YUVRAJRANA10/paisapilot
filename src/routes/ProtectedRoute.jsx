import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-secondary text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function AuthRequiredRoute({ children, redirectTo = '/login' }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to={redirectTo} replace />

  return children
}