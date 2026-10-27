import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function DonutChart({ data, width = 300, height = 300, title = '' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No data
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)

  const COLORS = [
    '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#14b8a6', '#6366f1', '#f97316', '#84cc16', '#06b6d4',
  ]

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="headline-md text-headline-md text-on-surface font-semibold mb-4">
          {title}
        </h3>
      )}
      <div style={{ width, height, margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              fill="#8884d8"
              dataKey="total"
              labelLine={false}
              label={({ value }) => {
                const pct = ((value / total) * 100).toFixed(0)
                return pct > 5 ? `${pct}%` : null
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0]
                const value = item.value || 0
                const pct = ((value / total) * 100).toFixed(1)
                return (
                  <div className="p-2 bg-surface-container-lowest border border-outline/30 rounded-lg shadow-elevated">
                    <div className="text-label-sm text-on-surface-variant">{item.name}</div>
                    <div className="text-label-md text-on-surface font-semibold">
                      ₹{(value / 100).toFixed(0)} ({pct}%)
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}