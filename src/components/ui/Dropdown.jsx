import React from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export function Dropdown({
  trigger,
  items,
  onItemClick,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div
      className={cn('relative inline-block', className)}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-between gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all duration-fast shadow-sm',
          triggerClassName
        )}
      >
        {trigger}
        <ChevronDown size={16} className="text-secondary" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline/30 rounded-lg shadow-elevated z-50 py-2',
            menuClassName
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setIsOpen(false)
                onItemClick?.(item)
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors',
                item.disabled && 'text-on-surface-variant/50 cursor-not-allowed'
              )}
              disabled={item.disabled}
            >
              {item.icon && <item.icon size={18} className="text-secondary" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}