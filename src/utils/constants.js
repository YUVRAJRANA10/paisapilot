export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Expense', icon: 'arrow-up-right', color: 'expense' },
  { value: 'income', label: 'Income', icon: 'arrow-down-left', color: 'income' },
]

export const PAYMENT_MODES = [
  'UPI',
  'Google Pay',
  'PhonePe',
  'Paytm',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Wallet',
  'Other',
]

export const RECURRENCE_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export const CATEGORIES_DEMO = [
  { id: 'cat-1', name: 'Food & Dining', icon: 'utensils', color: '#ef4444', budgetLimit: 15000 },
  { id: 'cat-2', name: 'Transport', icon: 'car', color: '#3b82f6', budgetLimit: 8000 },
  { id: 'cat-3', name: 'Shopping', icon: 'shopping-bag', color: '#8b5cf6', budgetLimit: 10000 },
  { id: 'cat-4', name: 'Entertainment', icon: 'film', color: '#ec4899', budgetLimit: 5000 },
  { id: 'cat-5', name: 'Bills & Utilities', icon: 'file-text', color: '#f59e0b', budgetLimit: 12000 },
  { id: 'cat-6', name: 'Healthcare', icon: 'heart-pulse', color: '#14b8a6', budgetLimit: 7000 },
  { id: 'cat-7', name: 'Education', icon: 'graduation-cap', color: '#6366f1', budgetLimit: 8000 },
  { id: 'cat-8', name: 'Investments', icon: 'trending-up', color: '#006948', budgetLimit: 20000 },
  { id: 'cat-9', name: 'Salary', icon: 'briefcase', color: '#006948', budgetLimit: 0 },
  { id: 'cat-10', name: 'Freelance', icon: 'laptop', color: '#006948', budgetLimit: 0 },
  { id: 'cat-11', name: 'Gifts', icon: 'gift', color: '#f97316', budgetLimit: 0 },
  { id: 'cat-12', name: 'Other Income', icon: 'plus-circle', color: '#006948', budgetLimit: 0 },
]

export const CHART_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
  '#84cc16', // lime
  '#06b6d4', // cyan
]

export const DEMO_USER = {
  id: 'user-demo',
  name: 'Yuvraj',
  email: 'yuvraj@demo.paisapilot.app',
  currency: 'INR',
  monthlyIncome: 85000,
  timezone: 'Asia/Kolkata',
}

export const PERIOD_OPTIONS = [
  { value: 'current-month', label: 'Current Month' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'this-year', label: 'This Year' },
]

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard' },
  { path: '/transactions', label: 'Transactions', icon: 'list-checks' },
  { path: '/budgets', label: 'Budgets', icon: 'target' },
  { path: '/analytics', label: 'Analytics', icon: 'bar-chart-3' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
]