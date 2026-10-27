import { AlertCircle, CreditCard, Inbox } from 'lucide-react'

const EMPTY_ICONS = {
  transactions: Inbox,
  budgets: CreditCard,
  general: AlertCircle,
}

export function EmptyState({
  type = 'general',
  title,
  description,
  action,
  actionLabel,
  icon: IconProp,
  className = '',
}) {
  const Icon = IconProp || EMPTY_ICONS[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center mb-4">
        <Icon size={32} className="text-secondary" />
      </div>
      {title && (
        <h3 className="headline-md text-headline-md text-on-surface font-semibold mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="body-md text-body-md text-secondary mb-6 max-w-xs">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}