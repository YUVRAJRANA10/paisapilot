import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BarChart3, Download, PieChart as PieChartIcon } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { DonutChart } from '../components/charts/DonutChart'
import { BarChart } from '../components/charts/BarChart'
import { realAdapter } from '../services/realAdapter'
const CURRENT_MONTH = new Date().toISOString().slice(0, 7)
const CURRENT_MONTH_LABEL = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
import { formatINR } from '../utils/format'

export default function Analytics() {
  const [report, setReport] = useState(null)
  const [exporting, setExporting] = useState(false)
  useEffect(() => { realAdapter.getDashboardReport({ month: CURRENT_MONTH }).then(setReport) }, [])
  const exportCsv = async () => {
    setExporting(true)
    try {
      const [year, month] = CURRENT_MONTH.split('-').map(Number)
      const from = new Date(Date.UTC(year, month - 1, 1)).toISOString()
      const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString()
      const blob = await realAdapter.exportReport({ from, to })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `paisapilot-${CURRENT_MONTH}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }
  if (!report) return <div className="p-12 text-center text-secondary">Loading analytics…</div>
  const { income, expense, savingsRate, categorySpending, monthlyTrend } = report
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-wider text-primary">Financial intelligence</p>
          <h1 className="headline-lg text-on-surface font-semibold">Analytics</h1>
          <p className="body-md text-secondary">Understand the patterns behind your {CURRENT_MONTH_LABEL} cash flow.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv} loading={exporting}>
          <Download size={16} /> Export CSV
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Income" value={formatINR(income)} icon={<ArrowUpRight />} tone="text-income" />
        <Metric label="Expenses" value={formatINR(expense)} icon={<ArrowDownRight />} tone="text-expense" />
        <Metric label="Savings rate" value={`${savingsRate.toFixed(0)}%`} icon={<BarChart3 />} tone="text-primary" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><div className="mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /><h2 className="font-semibold">Cash flow trend</h2></div><BarChart data={monthlyTrend} height={300} /></Card>
        <Card><div className="mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-primary" /><h2 className="font-semibold">Expense mix</h2></div><DonutChart data={categorySpending} width={320} height={300} /></Card>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, tone }) {
  return <Card><div className="flex items-center justify-between"><span className="text-sm text-secondary">{label}</span><span className={tone}>{icon}</span></div><p className="mt-3 text-2xl font-bold text-on-surface">{value}</p></Card>
}
