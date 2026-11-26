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
        const token = localStorage.getItem('paisapilot_token')
        if (!token) {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        const { user: currentUser } = await demoAdapter.authMe()
        if (mounted) setUser(currentUser)
      } catch (err) {
        localStorage.removeItem('paisapilot_token')
        localStorage.removeItem('paisapilot_user')
        if (mounted) setUser(null)
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
    localStorage.removeItem('paisapilot_user')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    setUser(prev => {
      if (!prev) return null
      const fullName = updates.full_name || updates.name || prev.name
      const updated = {
        ...prev,
        ...updates,
        name: fullName,
        full_name: fullName,
        user_metadata: {
          ...prev.user_metadata,
          ...updates.user_metadata,
          full_name: fullName,
        },
      }
      localStorage.setItem('paisapilot_user', JSON.stringify(updated))
      try {
        const profiles = JSON.parse(localStorage.getItem('paisapilot_profiles') || '{}')
        if (updated.email) profiles[updated.email.toLowerCase()] = updated
        localStorage.setItem('paisapilot_profiles', JSON.stringify(profiles))
      } catch (e) {}
      return updated
    })
    return { success: true }
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
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