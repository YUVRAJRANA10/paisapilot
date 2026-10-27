import { cn } from '../../utils/cn'

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-space-sm', className)}>
      {label && (
        <label className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full p-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant rounded-lg placeholder:text-on-surface-variant/60 transition-all duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest disabled:bg-surface-container-high disabled:cursor-not-allowed resize-none',
          error && 'border-error focus:ring-error/20',
          className
        )}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        {...props}
      />
      {error && <span className="text-error text-label-sm">{error}</span>}
      {helperText && !error && (
        <span className="text-on-surface-variant text-label-sm">{helperText}</span>
      )}
    </div>
  )
}