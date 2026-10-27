import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { demoAdapter } from '../services/demoAdapter'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await demoAdapter.authMe()
        if (mounted) setUser(currentUser)
      } catch (err) {
        // Not authenticated — that's OK for demo
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
      const { user: currentUser, accessToken } = await demoAdapter.authLogin({ email, password })
      localStorage.setItem('paisapilot_token', accessToken)
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
      const { user: currentUser, accessToken } = await demoAdapter.authRegister(payload)
      localStorage.setItem('paisapilot_token', accessToken)
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
      await demoAdapter.authLogout()
    } catch (err) {
      // Ignore errors during logout
    }
    localStorage.removeItem('paisapilot_token')
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