import { createContext, useContext, useState, useCallback } from 'react'

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [demoMode, setDemoMode] = useState(
    import.meta.env.VITE_DEMO_MODE === 'true' || true
  )

  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => {
      const next = !prev
      localStorage.setItem('paisapilot_demo_mode', String(next))
      return next
    })
  }, [])

  const resetDemoData = useCallback(() => {
    // In a real implementation, this would reload demo data from scratch
    window.location.reload()
  }, [])

  const value = {
    demoMode,
    toggleDemoMode,
    resetDemoData,
    isDemo: demoMode,
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider')
  }
  return context
}