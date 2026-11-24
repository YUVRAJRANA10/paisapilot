import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BarChart3, Download, PieChart as PieChartIcon } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { DonutChart } from '../components/charts/DonutChart'
import { BarChart } from '../components/charts/BarChart'
import { realAdapter } from '../services/realAdapter'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/format'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)
const CURRENT_MONTH_LABEL = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

export default function Analytics() {
  const { user } = useAuth()
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

  const baseSalary = user?.monthlyIncomePaise || 0
  const grossIncome = baseSalary > 0
    ? (report.income >= baseSalary ? report.income : baseSalary + report.income)
    : report.income
  const grossExpense = report.expense || 0
  const netSavings = grossIncome - grossExpense
  const grossSavingsRate = grossIncome > 0
    ? Math.max(0, Number(((netSavings / grossIncome) * 100).toFixed(0)))
    : 0

  const effectiveMonthlyTrend = (report.monthlyTrend || []).map(m => {
    if (m.month === CURRENT_MONTH && baseSalary > 0) {
      const inc = Math.max(m.income, grossIncome)
      return { ...m, income: inc, balance: inc - m.expense }
    }
    return m
  })

  const { categorySpending } = report

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
        <Metric label="Gross Income" value={formatINR(grossIncome)} icon={<ArrowUpRight />} tone="text-income" />
        <Metric label="Expenses" value={formatINR(grossExpense)} icon={<ArrowDownRight />} tone="text-expense" />
        <Metric label="Savings rate" value={`${grossSavingsRate}%`} icon={<BarChart3 />} tone="text-primary" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><div className="mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /><h2 className="font-semibold">Cash flow trend</h2></div><BarChart data={effectiveMonthlyTrend} height={300} /></Card>
        <Card><div className="mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-primary" /><h2 className="font-semibold">Expense mix</h2></div><DonutChart data={categorySpending} width={320} height={300} /></Card>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, tone }) {
  return <Card><div className="flex items-center justify-between"><span className="text-sm text-secondary">{label}</span><span className={tone}>{icon}</span></div><p className="mt-3 text-2xl font-bold text-on-surface">{value}</p></Card>
}
