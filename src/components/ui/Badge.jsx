import { cn } from '../../utils/cn'

export function Badge({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) {
  const variants = {
    income: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    expense: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    waypoint: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
    primary: 'bg-primary text-on-primary',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}