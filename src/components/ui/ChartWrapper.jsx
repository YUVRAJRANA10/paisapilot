import { ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/cn'

export function ChartWrapper({ children, height = 300, className = '' }) {
  return (
    <div className={cn('w-full h-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}