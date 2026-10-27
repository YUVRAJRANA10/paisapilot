import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'

export function Sparkline({ data, dataKey = 'value', height = 60, color = '#006948', title = '' }) {
  if (!data || data.length === 0) return null

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-sm text-label-sm text-secondary uppercase tracking-wider">{title}</span>
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}