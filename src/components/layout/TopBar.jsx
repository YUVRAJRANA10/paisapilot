import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'
import { DEMO_USER } from '../../utils/constants'

export function TopBar({ user = DEMO_USER }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [period, setPeriod] = useState('Current Month')

  return (
    <header className="h-16 border-b border-outline/30 bg-surface-container-low backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-64 pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-outline-variant rounded-lg shadow-sm">
              <button
                onClick={() => setPeriod('Current Month')}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  period === 'Current Month'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                Current Month
              </button>
              <button
                onClick={() => setPeriod('Last 30 Days')}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  period === 'Last 30 Days'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="text-sm font-medium text-on-surface">PaisaPilot Demo</div>
            <div className="text-xs text-secondary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Demo data
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden md:block text-sm font-medium text-on-surface">
                {user?.name || 'User'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}