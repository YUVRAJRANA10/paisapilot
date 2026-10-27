import { useState, useEffect, useCallback } from 'react'

export function useAuth() {
  // Placeholder — real implementation uses AuthContext
  return { user: null, loading: true, isAuthenticated: false, login: () => {}, logout: () => {} }
}

export function useDemoMode() {
  return { demoMode: true, toggleDemoMode: () => {}, resetDemoData: () => {} }
}

export function useDebounce(callback, delay) {
  let timeoutId
  return useCallback((...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

export function useDemoData() {
  // Hook for components to access demo data through the adapter
  // This is a thin wrapper — pages should call demoAdapter methods directly
  return null
}