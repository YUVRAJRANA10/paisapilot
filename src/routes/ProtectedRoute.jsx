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