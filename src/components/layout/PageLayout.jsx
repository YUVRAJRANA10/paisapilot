import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '../../utils/cn'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export function PageLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden',
          collapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}