import { cn } from '../../utils/cn'

export function Input({
  label,
  helperText,
  error,
  disabled,
  required,
  prefix,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-space-sm', className)}>
      {label && (
        <label className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
          {label}{required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-sm text-body-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          className={cn(
            'w-full h-10 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant rounded-lg placeholder:text-on-surface-variant/60 transition-all duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest disabled:bg-surface-container-high disabled:cursor-not-allowed',
            prefix && 'pl-8',
            error && 'border-error focus:ring-error/20',
            inputClassName
          )}
          disabled={disabled}
          {...props}
        />
      </div>
      {error && (
        <span className="text-error text-label-sm">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-on-surface-variant text-label-sm">{helperText}</span>
      )}
    </div>
  )
}