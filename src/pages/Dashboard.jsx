import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Clock, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Info, DollarSign, Wallet } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { DonutChart } from '../components/charts/DonutChart'
import { BarChart } from '../components/charts/BarChart'
import { Sparkline } from '../components/charts/Sparkline'
import { TransactionForm } from '../components/forms/TransactionForm'
import { demoAdapter } from '../services/demoAdapter'
import { formatINR, formatDate, formatShortDate, getMonthsArray, calculateSavingsRate, calculatePercentage } from '../utils/format'
import { cn } from '../utils/cn'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [categorySpending, setCategorySpending] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [insights, setInsights] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showAddModal, setShowAddModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [reportResult, budgetResult] = await Promise.all([
        demoAdapter.getDashboardReport({ month: selectedMonth }),
        demoAdapter.getBudgets({ month: selectedMonth }),
      ])

      setSummary(reportResult.summary)
      setCategorySpending(reportResult.categorySpending)
      setMonthlyTrend(reportResult.monthlyTrend)
      setBudgets(budgetResult.budgets)

      const txnResult = await demoAdapter.getTransactions({ limit: 6 })
      setRecentTransactions(txnResult.transactions)

      const { DEMO_INSIGHTS } = await import('../services/demoData')
      setInsights(DEMO_INSIGHTS)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    }
  }, [selectedMonth])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddTransaction = (transaction) => {
    setRecentTransactions(prev => [transaction, ...prev].slice(0, 6))
    setShowAddModal(false)
    loadData()
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse rounded-full h-8 w-8 bg-surface-container-high" />
      </div>
    )
  }

  const monthlyIncome = summary.income
  const monthlyExpense = summary.expense
  const balance = summary.balance
  const savingsRate = summary.savingsRate

  const budgetItems = budgets.map(b => ({
    ...b,
    percentage: b.limit > 0 ? calculatePercentage(b.used, b.limit) : 0,
    isOverBudget: b.used > b.limit,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm text-primary font-medium">
          Demo Mode — Using demonstration data. No real bank accounts or UPI services are connected.
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
            Welcome back, Aditi
          </h1>
          <p className="body-md text-body-md text-secondary">
            Your money, under control. Here's your financial flightpath for{' '}
            <span className="font-medium text-on-surface">
              {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 rounded-xl bg-surface-container-high" role="group">
            <button
              onClick={() => setSelectedMonth(new Date().toISOString().slice(0, 7))}
              className="px-3.5 py-1.5 rounded-lg text-label-md font-label-md bg-surface-container-lowest text-on-surface shadow-sm transition-colors"
            >
              {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedMonth + '-01')
                d.setMonth(d.getMonth() - 1)
                setSelectedMonth(d.toISOString().slice(0, 7))
              }}
              className="px-3.5 py-1.5 rounded-lg text-label-md font-label-md text-secondary hover:text-on-surface transition-colors"
            >
              Previous Month
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedMonth + '-01')
                d.setMonth(d.getMonth() + 1)
                setSelectedMonth(d.toISOString().slice(0, 7))
              }}
              className="px-3.5 py-1.5 rounded-lg text-label-md font-label-md text-secondary hover:text-on-surface transition-colors"
            >
              Next Month
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padded={false} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Balance</p>
            </div>
            <Wallet size={20} className="text-secondary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">{formatINR(balance)}</span>
          </div>
          <Sparkline
            data={monthlyTrend.map((m, i) => ({ value: m.balance, label: m.label }))}
            dataKey="value"
            color={balance >= 0 ? '#006948' : '#ef4444'}
            height={40}
          />
        </Card>

        <Card padded={false} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-sm text-label-sm text-secondary uppercase tracking-wider">Monthly Income</p>
            </div>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">{formatINR(monthlyIncome)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-label-sm text-emerald-600 font-medium">+12% vs last month</span>
          </div>
        </Card>
        <Card padded={false} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-sm text-label-sm text-secondary uppercase tracking-wider">Monthly Expenses</p>
            </div>
            <DollarSign size={20} className="text-red-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">{formatINR(monthlyExpense)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-label-sm text-red-600 font-medium">-5% vs last month</span>
          </div>
        </Card>

        <Card padded={false} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-sm text-label-sm text-secondary uppercase tracking-wider">Savings Rate</p>
            </div>
            <CheckCircle size={20} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">{savingsRate.toFixed(0)}%</span>
          </div>
          <div className="mt-3 w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: Math.min(savingsRate, 100) + '%' }} />
          </div>
          <p className="text-label-sm text-on-surface-variant mt-1">
            {monthlyIncome > 0 ? `₹${((monthlyIncome - monthlyExpense) / 100).toFixed(0)} saved this month` : '₹0 saved'}
          </p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetItems.map(budget => {
          const pct = budget.percentage
          const isOver = budget.isOverBudget
          return (
            <Card key={budget.id} padded={false} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.categoryColor || '#9ca3af' }} />
                  <span className="text-label-md font-medium text-on-surface">{budget.categoryName}</span>
                </div>
                <Badge variant={isOver ? 'warning' : 'neutral'} className="text-xs">
                  {pct.toFixed(0)}%
                </Badge>
              </div>
              <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden mb-2">
                <div className={cn('h-full rounded-full transition-all duration-500', isOver ? 'bg-error' : 'bg-primary')} style={{ width: Math.min(pct, 100) + '%' }} />
              </div>
              <div className="flex justify-between text-label-sm">
                <span className="text-on-surface-variant">
                  {formatINR(budget.used)} / {formatINR(budget.limit)}
                </span>
                {isOver && (
                  <span className="text-error font-medium">
                    Over by {formatINR(budget.used - budget.limit)}
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
        <Card padded={false} className="p-6">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardSubtitle>Income vs Expense over the last 6 months</CardSubtitle>
          </CardHeader>
          <CardContent>
            <BarChart data={monthlyTrend} height={300} title="Cash Flow" />
          </CardContent>
        </Card>

        <Card padded={false} className="p-6">
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardSubtitle>Where your money went this month</CardSubtitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 min-w-[280px]">
                <DonutChart data={categorySpending} width={320} height={320} title="" />
              </div>
              <div className="flex-1 space-y-3">
                {categorySpending.slice(0, 5).map(item => {
                  const catColor = item.categoryColor || '#9ca3af'
                  return (
                    <div key={item.categoryId} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }} />
                      <div className="flex-1">
                        <div className="text-label-sm text-label-sm text-on-surface font-medium">{item.categoryName}</div>
                        <div className="text-label-sm text-on-surface-variant">
                          ₹{(item.total / 100).toFixed(0)} ({item.percentage.toFixed(0)}%)
                        </div>
                      </div>
                      <div className="text-right text-label-sm font-mono tabular-nums text-on-surface">
                        -₹{(item.total / 100).toFixed(0)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padded={false} className="p-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardSubtitle>Showing last 6 transactions this month</CardSubtitle>
                </div>
                <Link to="/transactions" className="text-label-sm text-primary hover:text-primary-container font-medium">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                columns={[
                  { key: 'merchant', label: 'Merchant', align: 'left' },
                  { key: 'category', label: 'Category', align: 'left' },
                  { key: 'date', label: 'Date', align: 'left' },
                  { key: 'paymentMode', label: 'Payment Mode', align: 'left' },
                  { key: 'type', label: 'Type', align: 'center' },
                  { key: 'amount', label: 'Amount', align: 'right' },
                  { key: 'status', label: 'Status', align: 'center' },
                ]}
                data={recentTransactions.map(txn => ({
                  id: txn.id,
                  merchant: (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center">
                        <Clock size={16} className="text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-on-surface">{txn.categoryName || txn.paymentAccount || 'Unknown'}</div>
                        <div className="text-xs text-secondary">{txn.note || ''}</div>
                      </div>
                    </div>
                  ),
                  category: (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: txn.categoryColor || '#9ca3af' }} />
                      {txn.categoryName}
                    </span>
                  ),
                  date: formatShortDate(txn.date),
                  paymentMode: txn.paymentMode,
                  type: (
                    <Badge variant={txn.type === 'income' ? 'income' : 'expense'}>
                      {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                    </Badge>
                  ),
                  amount: (
                    <span className={cn('font-mono tabular-nums font-semibold text-right', txn.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                      {txn.type === 'income' ? '+' : '-'}₹{(txn.amount / 100).toFixed(2)}
                    </span>
                  ),
                  status: (
                    <Badge variant="neutral" className="text-xs">{txn.status}</Badge>
                  ),
                }))}
              />
            </CardContent>
            <CardFooter className="pt-4 pb-4 border-t border-outline/30">
              <Button variant="primary" className="w-full" onClick={() => setShowAddModal(true)}>
                <Plus size={18} className="mr-2" />
                Add Transaction
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card padded={false} className="p-6">
            <CardHeader className="pb-4">
              <CardTitle>PaisaPilot Insights</CardTitle>
              <CardSubtitle>Smart suggestions based on your spending</CardSubtitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {insights.map(insight => {
                const iconMap = { alert: AlertCircle, info: Info, success: CheckCircle }
                const Icon = iconMap[insight.type] || Info
                const typeConfig = {
                  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
                  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
                  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                }
                const config = typeConfig[insight.type] || typeConfig.info
                return (
                  <div key={insight.id} className={cn('flex items-start gap-3 p-3 rounded-lg border', config.bg, config.border)}>
                    <div className="mt-1"><Icon size={18} className={config.text} /></div>
                    <div className="flex-1">
                      <div className="text-label-sm font-medium text-on-surface">{insight.title}</div>
                      <div className="text-body-sm text-on-surface-variant mt-0.5">{insight.description}</div>
                      <button onClick={() => {}} className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        {insight.action} <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full', config.dot)} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddTransaction}
      />
    </div>
  )
}