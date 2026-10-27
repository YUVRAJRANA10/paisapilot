import { cn } from '../../utils/cn'

export function LoadingSkeleton({
  className = '',
  shape = 'rect',
  size = 'md',
  animated = true,
}) {
  const sizes = {
    sm: 'h-8 w-24',
    md: 'h-12 w-48',
    lg: 'h-16 w-64',
    circle: 'h-12 w-12 rounded-full',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-surface-container-low rounded-lg',
        animated && 'animate-pulse',
        sizes[size],
        className
      )}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          size={i === lines - 1 ? 'sm' : 'md'}
          className="w-full"
        />
      ))}
    </div>
  )
}