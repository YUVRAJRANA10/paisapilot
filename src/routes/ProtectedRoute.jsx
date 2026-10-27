export function ProtectedRoute({ children }) {
  // In demo mode, all routes are accessible
  // Real auth check will be added in backend integration phase
  return <>{children}</>
}

export function AuthRequiredRoute({ children, redirectTo = '/login' }) {
  // Placeholder — real implementation checks AuthContext
  return <>{children}</>
}