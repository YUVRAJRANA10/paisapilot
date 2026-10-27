import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Target } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { demoAdapter } from '../services/demoAdapter'
import { DEMO_CURRENT_MONTH } from '../services/demoData'
import { calculatePercentage, formatINR } from '../utils/format'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    demoAdapter.getBudgets({ month: DEMO_CURRENT_MONTH }).then(result => setBudgets(result.budgets))
  }, [])

  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalUsed = budgets.reduce((sum, budget) => sum + budget.used, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label-sm uppercase tracking-wider text-primary">Control center</p>
        <h1 className="headline-lg text-on-surface font-semibold">Monthly budgets</h1>
        <p className="body-md text-secondary">Keep category spending aligned with your October plan.</p>
      </div>
      <Card className="bg-inverse-surface text-inverse-on-surface">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-inverse-on-surface/70">Total allocated</p>
            <p className="mt-1 text-3xl font-bold">{formatINR(totalLimit)}</p>
          </div>
          <div>
            <p className="text-sm text-inverse-on-surface/70">Used this month</p>
            <p className="mt-1 text-3xl font-bold text-primary-fixed">{formatINR(totalUsed)}</p>
          </div>
          <div className="min-w-48">
            <div className="mb-2 flex justify-between text-xs text-inverse-on-surface/70">
              <span>Overall utilization</span><span>{totalLimit ? Math.round(totalUsed / totalLimit * 100) : 0}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary-fixed" style={{ width: `${Math.min(100, totalUsed / totalLimit * 100)}%` }} />
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map(budget => {
          const percentage = calculatePercentage(budget.used, budget.limit)
          const over = budget.used > budget.limit
          return (
            <Card key={budget.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Target size={18} /></div>
                  <div><h2 className="font-semibold text-on-surface">{budget.categoryName}</h2><p className="text-xs text-secondary">Monthly allocation</p></div>
                </div>
                <Badge variant={over ? 'warning' : 'neutral'}>{over ? 'Over budget' : `${Math.round(percentage)}%`}</Badge>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm"><span>{formatINR(budget.used)} spent</span><span className="text-secondary">of {formatINR(budget.limit)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div className={`h-full rounded-full ${over ? 'bg-error' : percentage >= 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${Math.min(100, percentage)}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
                  {over ? <AlertTriangle size={14} className="text-error" /> : <CheckCircle2 size={14} className="text-primary" />}
                  {over ? `${formatINR(budget.used - budget.limit)} over limit` : `${formatINR(budget.limit - budget.used)} remaining`}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
