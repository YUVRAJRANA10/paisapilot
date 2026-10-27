import { AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export function ErrorAlert({
  message,
  onDismiss,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container border border-error/20',
        className
      )}
    >
      <AlertCircle size={20} className="text-error mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-error text-body-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  )
}