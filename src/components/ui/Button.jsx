import { cn } from '../../utils/cn'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-1.5 font-label-md text-label-md font-semibold rounded-lg transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-primary text-on-primary shadow-sm hover:bg-primary-container focus:ring focus:ring-primary/30',
    secondary:
      'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low focus:ring focus:ring-primary/30',
    ghost:
      'text-on-surface-variant hover:bg-surface-container-high focus:ring focus:ring-primary/30',
    cockpit:
      'bg-white/5 text-inverse-on-surface border border-white/10 hover:bg-white/10 focus:ring focus:ring-primary/30',
    danger:
      'bg-error text-on-error hover:bg-error/90 focus:ring focus:ring-error/30',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-label-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-2.5 text-label-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  )
}