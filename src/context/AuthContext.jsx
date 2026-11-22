import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { realAdapter } from '../services/realAdapter'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await realAdapter.authMe()
        if (mounted) setUser(currentUser)
      } catch (err) {
        if (mounted && err.status !== 401) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    checkAuth()
    return () => { mounted = false }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { user: currentUser } = await realAdapter.authLogin({ email, password })
      setUser(currentUser)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Login failed')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const { confirmPassword, monthlyIncome, ...registration } = payload
      const { user: currentUser } = await realAdapter.authRegister(registration)
      setUser(currentUser)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Registration failed')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await realAdapter.authLogout()
    } catch (err) {
      // Ignore errors during logout
    }
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}