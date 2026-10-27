import { cn } from '../../utils/cn'

export function Table({
  columns,
  data,
  className = '',
  striped = true,
  hoverable = true,
  ...props
}) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-outline/30 bg-surface-container-lowest', className)}>
      <table className="w-full text-left border-collapse" {...props}>
        <thead>
          <tr className="bg-surface-container-low border-b border-outline/30">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={cn(
                'border-b border-outline/30 hover:bg-surface-container-low/40 transition-colors min-h-[48px]',
                rowIndex === data.length - 1 && 'border-b-0'
              )}
            >
              {columns.map(col => {
                const cellValue = col.render ? col.render(row, col.key) : row[col.key]
                return (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 font-body-md text-body-md text-on-surface',
                      col.align === 'right' && 'text-right font-mono tabular-nums',
                      col.align === 'center' && 'text-center',
                      col.tdClassName
                    )}
                  >
                    {cellValue}
                  </td>
                )
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-on-surface-variant text-body-md"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}