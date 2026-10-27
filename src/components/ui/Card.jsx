import { cn } from '../../utils/cn'

export function Card({ children, className = '', padded = true, hoverable = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest border border-outline/30 rounded-xl shadow-card transition-shadow duration-fast',
        hoverable && 'hover:shadow-card-hover',
        padded && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={cn('headline-lg text-headline-lg text-on-surface font-semibold mb-1', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardSubtitle({ children, className = '', ...props }) {
  return (
    <p className={cn('body-md text-body-md text-secondary', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={cn('mt-4 flex items-center justify-between gap-space-sm', className)} {...props}>
      {children}
    </div>
  )
}