import { cn } from '../../utils/cn'

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
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
      <div className="relative">
        <select
          className={cn(
            'w-full h-10 px-3 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant rounded-lg appearance-none cursor-pointer transition-all duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest disabled:bg-surface-container-high disabled:cursor-not-allowed',
            error && 'border-error focus:ring-error/20'
          )}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-2.5 pointer-events-none text-secondary text-[18px]">
          ▾
        </span>
      </div>
      {error && <span className="text-error text-label-sm">{error}</span>}
      {helperText && !error && (
        <span className="text-on-surface-variant text-label-sm">{helperText}</span>
      )}
    </div>
  )
}