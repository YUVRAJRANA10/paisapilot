import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function BarChart({ data, width, height = 300, title = '' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No data
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="headline-md text-headline-md text-on-surface font-semibold mb-4">
          {title}
        </h3>
      )}
      <div style={{ width, height, margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
            <defs>
              <style>{`
                .recharts-tooltip-wrapper {
                  z-index: 9999;
                }
              `}</style>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7a9e' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload
                  const type = payload[0].dataKey
                  const label = type === 'income' ? 'Income' : 'Expense'
                  const color = type === 'income' ? '#006948' : '#ef4444'
                  return (
                    <div className="p-2 bg-surface-container-lowest border border-outline/30 rounded-lg shadow-elevated">
                      <div className="text-label-sm text-on-surface-variant">{item.label}</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-label-sm text-on-surface">{label}</span>
                      </div>
                      <div className="text-label-md text-on-surface font-semibold">
                        ₹{(item[type] / 100).toFixed(0)}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend verticalAlign="top" align="right" height={36} />
            <Bar dataKey="income" fill="#006948" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}