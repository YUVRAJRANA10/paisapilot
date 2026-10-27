import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import { Table } from '../components/ui/Table'
import { TransactionForm } from '../components/forms/TransactionForm'
import { demoAdapter } from '../services/demoAdapter'
import { DEMO_CATEGORIES } from '../services/demoData'
import { formatINR, formatShortDate } from '../utils/format'
import { cn } from '../utils/cn'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const result = await demoAdapter.getTransactions({
        limit: 100,
        type,
        category,
        from: from ? `${from}T00:00:00` : undefined,
        to: to ? `${to}T23:59:59` : undefined,
      })
      setTransactions(result.transactions)
    } finally {
      setLoading(false)
    }
  }, [type, category, from, to])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return transactions
    return transactions.filter(transaction =>
      [transaction.note, transaction.categoryName, transaction.paymentMode, transaction.paymentAccount]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query, transactions])

  const handleSave = async payload => {
    if (payload.id) {
      await demoAdapter.updateTransaction(payload.id, payload)
    } else {
      await demoAdapter.createTransaction(payload)
    }
    setShowAddModal(false)
    setEditingTransaction(null)
    loadTransactions()
  }

  const handleDelete = async transaction => {
    if (!window.confirm(`Delete "${transaction.note || transaction.categoryName}"?`)) return
    await demoAdapter.deleteTransaction(transaction.id)
    loadTransactions()
  }

  const columns = [
    {
      key: 'transaction',
      label: 'Transaction',
      render: transaction => (
        <div>
          <div className="font-semibold text-on-surface">{transaction.note || transaction.categoryName}</div>
          <div className="text-xs text-secondary">{transaction.paymentAccount || transaction.paymentMode}</div>
        </div>
      ),
    },
    { key: 'categoryName', label: 'Category' },
    { key: 'date', label: 'Date', render: transaction => formatShortDate(transaction.date) },
    { key: 'paymentMode', label: 'Method' },
    {
      key: 'type',
      label: 'Type',
      align: 'center',
      render: transaction => <Badge variant={transaction.type === 'income' ? 'income' : 'expense'}>{transaction.type}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: transaction => (
        <span className={cn('font-semibold', transaction.type === 'income' ? 'text-income' : 'text-expense')}>
          {transaction.type === 'income' ? '+' : '-'}{formatINR(transaction.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: transaction => (
        <div className="flex justify-end gap-1">
          <button type="button" onClick={() => setEditingTransaction(transaction)} className="rounded-md p-2 text-secondary hover:bg-surface-container-high hover:text-on-surface" aria-label={`Edit ${transaction.note || transaction.categoryName}`}>
            <Pencil size={15} />
          </button>
          <button type="button" onClick={() => handleDelete(transaction)} className="rounded-md p-2 text-error hover:bg-error/10" aria-label={`Delete ${transaction.note || transaction.categoryName}`}>
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label-sm uppercase tracking-wider text-primary">Ledger</p>
          <h1 className="headline-lg text-on-surface font-semibold">Transactions</h1>
          <p className="body-md text-secondary">Search and organize every inflow and outflow in your demo ledger.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus size={17} /> Add transaction</Button>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline/30 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              aria-label="Search transactions"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search notes, categories, or payment methods"
              className="input-base pl-10"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowFilters(value => !value)}>
            <SlidersHorizontal size={16} /> Filters <Filter size={14} />
          </Button>
          {(query || type || category || from || to) && (
            <Button variant="ghost" onClick={() => { setQuery(''); setType(''); setCategory(''); setFrom(''); setTo('') }}>
              <X size={15} /> Clear
            </Button>
          )}
        </div>
        {showFilters && (
          <div className="grid gap-4 border-b border-outline/30 bg-surface-container-low p-4 sm:grid-cols-2">
            <Select label="Type" value={type} onChange={setType} placeholder="All types" options={[
              { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' },
            ]} />
            <Select label="Category" value={category} onChange={setCategory} placeholder="All categories"
              options={DEMO_CATEGORIES.map(item => ({ value: item.id, label: item.name }))} />
            <label className="flex flex-col gap-2 text-label-sm uppercase tracking-wider text-secondary">
              From
              <input aria-label="Filter from date" type="date" value={from} onChange={event => setFrom(event.target.value)} className="input-base" />
            </label>
            <label className="flex flex-col gap-2 text-label-sm uppercase tracking-wider text-secondary">
              To
              <input aria-label="Filter to date" type="date" value={to} onChange={event => setTo(event.target.value)} className="input-base" />
            </label>
          </div>
        )}
        {loading ? (
          <div className="p-12 text-center text-secondary">Loading ledger…</div>
        ) : (
          <Table columns={columns} data={visibleTransactions} />
        )}
        <div className="border-t border-outline/30 px-4 py-3 text-sm text-secondary">
          Showing {visibleTransactions.length} of {transactions.length} transactions
        </div>
      </Card>
      <TransactionForm
        isOpen={showAddModal || !!editingTransaction}
        transaction={editingTransaction}
        onClose={() => { setShowAddModal(false); setEditingTransaction(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
