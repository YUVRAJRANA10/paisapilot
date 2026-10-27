import { NavLink } from 'react-router-dom'
import { LogOut, Menu, ChevronLeft, LayoutDashboard, ListChecks, Target, BarChart3, Settings } from 'lucide-react'
import { cn } from '../../utils/cn'
import { DEMO_USER } from '../../utils/constants'

const SIDEBAR_WIDTH = 'w-64'
const SIDEBAR_WIDTH_COLLAPSED = 'w-16'

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full border-r border-white/10 z-30 transition-all duration-300',
        collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
        'bg-inverse-surface text-inverse-on-surface flex flex-col'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
            PP
          </div>
          {!collapsed && (
            <span className="headline-lg text-headline-lg font-bold tracking-tight">
              Paisa<span className="text-primary">Pilot</span>
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-2 text-inverse-on-surface hover:bg-white/10 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronLeft size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {[
          { path: '/', label: 'Dashboard', icon: 'layout-dashboard' },
          { path: '/transactions', label: 'Transactions', icon: 'list-checks' },
          { path: '/budgets', label: 'Budgets', icon: 'target' },
          { path: '/analytics', label: 'Analytics', icon: 'bar-chart-3' },
          { path: '/settings', label: 'Settings', icon: 'settings' },
        ].map(item => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-inverse-on-surface/70 hover:bg-white/10 hover:text-inverse-on-surface'
                )
              }
            >
              <span className="w-5 opacity-70"><NavIcon name={item.icon} size={18} /></span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs">
            {DEMO_USER.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn('text-sm font-medium text-inverse-on-surface', collapsed && 'hidden')}>
              {DEMO_USER.name}
            </div>
            <div className={cn('text-xs text-inverse-on-surface/60', collapsed && 'hidden')}>
              {DEMO_USER.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={18} />
          <span className={cn(collapsed && 'hidden')}>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

function NavIcon({ name, size }) {
  const icons = {
    'layout-dashboard': LayoutDashboard,
    'list-checks': ListChecks,
    target: Target,
    'bar-chart-3': BarChart3,
    settings: Settings,
  }
  const Icon = icons[name] || Settings
  return <Icon size={size} />
}