import {
  DEMO_TRANSACTIONS,
  DEMO_CATEGORIES,
  DEMO_BUDGETS,
  DEMO_INSIGHTS,
} from './demoData'
import {
  calculateSavingsRate,
  getMonthsArray,
} from '../utils/format'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ---- Mutable in-memory demo state (copied so the originals stay untouched) ----
let demoAuthToken = null
let demoUser = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@example.com',
}
const demoTransactions = [...DEMO_TRANSACTIONS]
const demoCategories = [...DEMO_CATEGORIES]
const demoBudgets = [...DEMO_BUDGETS]

export const ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  user: {
    preferences: '/api/user/preferences',
  },
  categories: '/api/categories',
  categoryById: id => '/api/categories/' + id,
  transactions: '/api/transactions',
  transactionById: id => '/api/transactions/' + id,
  budgetById: id => '/api/budgets/' + id,
  budgetComparison: '/api/budgets/comparison',
  recurring: '/api/recurring',
  recurringById: id => '/api/recurring/' + id,
  recurringPause: id => '/api/recurring/' + id + '/pause',
  recurringResume: id => '/api/recurring/' + id + '/resume',
  reports: {
    dashboard: '/api/reports/dashboard',
    categorySpending: '/api/reports/category-spending',
    monthlyTrend: '/api/reports/monthly-trend',
    exportCsv: '/api/reports/export/csv',
    exportPdf: '/api/reports/export/pdf',
  },
}

export const demoAdapter = {
  // ---------------- Auth ----------------
  async authRegister(payload) {
    await delay(400)
    if (demoAuthToken) throw new Error('Already logged in')
    demoAuthToken = 'demo-jwt-token-' + Date.now()
    demoUser = { ...demoUser, ...payload }
    return { user: demoUser, accessToken: demoAuthToken }
  },

  async authLogin(payload) {
    await delay(500)
    if (demoAuthToken) throw new Error('Already logged in')
    demoAuthToken = 'demo-jwt-token-' + Date.now()
    return { user: demoUser, accessToken: demoAuthToken }
  },

  async authLogout() {
    await delay(200)
    demoAuthToken = null
    return { ok: true }
  },

  async authMe() {
    await delay(200)
    if (!demoAuthToken) throw new Error('Not authenticated')
    return { user: demoUser }
  },

  // ---------------- Categories ----------------
  async getCategories() {
    await delay(300)
    return { categories: demoCategories }
  },

  async createCategory(payload) {
    await delay(400)
    const category = {
      id: 'cat-' + Date.now(),
      userId: demoUser.id,
      ...payload,
      budgetLimit: payload.budgetLimit || 0,
    }
    demoCategories.push(category)
    return { category }
  },

  async updateCategory(id, payload) {
    await delay(400)
    const idx = demoCategories.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Category not found')
    demoCategories[idx] = { ...demoCategories[idx], ...payload }
    return { category: demoCategories[idx] }
  },

  async deleteCategory(id) {
    await delay(300)
    const idx = demoCategories.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Category not found')
    demoCategories.splice(idx, 1)
    return { ok: true }
  },

  // ---------------- Transactions ----------------
  async getTransactions(params = {}) {
    await delay(400)
    let filtered = [...demoTransactions]
    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter(t => new Date(t.date) >= fromDate)
    }
    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter(t => new Date(t.date) <= toDate)
    }
    if (params.type) {
      filtered = filtered.filter(t => t.type === params.type)
    }
    if (params.category) {
      filtered = filtered.filter(t => t.categoryId === params.category)
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 20
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)
    return { transactions: paginated, page, limit, total, totalPages }
  },

  async createTransaction(payload) {
    await delay(400)
    const cat = demoCategories.find(c => c.id === payload.categoryId)
    const transaction = {
      id: 'txn-' + Date.now(),
      userId: demoUser.id,
      categoryName: cat ? cat.name : 'Unknown',
      ...payload,
    }
    demoTransactions.push(transaction)
    return { transaction }
  },

  async updateTransaction(id, payload) {
    await delay(400)
    const idx = demoTransactions.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Transaction not found')
    demoTransactions[idx] = { ...demoTransactions[idx], ...payload }
    return { transaction: demoTransactions[idx] }
  },

  async deleteTransaction(id) {
    await delay(300)
    const idx = demoTransactions.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Transaction not found')
    demoTransactions.splice(idx, 1)
    return { ok: true }
  },

  async getTransactionSummary(params = {}) {
    await delay(300)
    const { from, to } = params
    let filtered = demoTransactions
    if (from) filtered = filtered.filter(t => new Date(t.date) >= new Date(from))
    if (to) filtered = filtered.filter(t => new Date(t.date) <= new Date(to))
    let income = 0
    let expense = 0
    filtered.forEach(t => {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    })
    const balance = income - expense
    const savingsRate = income > 0 ? calculateSavingsRate(income, expense) : 0
    return {
      income,
      expense,
      balance,
      savingsRate,
      transactionCount: filtered.length,
    }
  },

  // ---------------- Budgets ----------------
  async getBudgets(params = {}) {
    await delay(300)
    let filtered = demoBudgets
    if (params.month) {
      filtered = filtered.filter(b => b.month === params.month)
    }
    return { budgets: filtered }
  },

  // ---------------- Reports ----------------
  async getDashboardReport(params = {}) {
    await delay(400)
    const { month } = params
    const targetMonth = month || new Date().toISOString().slice(0, 7)
    const monthTransactions = demoTransactions.filter(t => t.date.startsWith(targetMonth))
    let income = 0
    let expense = 0
    monthTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    })
    const balance = income - expense
    const savingsRate = income > 0 ? calculateSavingsRate(income, expense) : 0

    const categorySpending = {}
    monthTransactions.forEach(t => {
      if (t.type === 'expense') {
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount
      }
    })
    const categorySpendingArray = Object.entries(categorySpending)
      .map(([categoryId, total]) => {
        const cat = demoCategories.find(c => c.id === categoryId)
        return {
          categoryId,
          categoryName: cat ? cat.name : 'Unknown',
          categoryColor: cat ? cat.color : '#9ca3af',
          total,
          count: monthTransactions.filter(t => t.categoryId === categoryId).length,
        }
      })
      .sort((a, b) => b.total - a.total)

    const monthlyTrend = getMonthsArray(6).map(m => {
      const monthTxns = demoTransactions.filter(t => t.date.startsWith(m.key))
      let mIncome = 0
      let mExpense = 0
      monthTxns.forEach(t => {
        if (t.type === 'income') mIncome += t.amount
        else mExpense += t.amount
      })
      return { key: m.key, income: mIncome, expense: mExpense, balance: mIncome - mExpense }
    })

    return {
      income,
      expense,
      balance,
      savingsRate,
      categorySpending: categorySpendingArray,
      monthlyTrend,
    }
  },

  async getInsights() {
    await delay(300)
    return { insights: DEMO_INSIGHTS }
  },

  // ---------------- Recurring ----------------
  async getRecurring() {
    await delay(300)
    const recurring = demoTransactions
      .filter(t => t.isRecurring)
      .map(t => ({
        id: t.id,
        userId: t.userId,
        categoryId: t.categoryId,
        categoryName: t.categoryName,
        amount: t.amount,
        frequency: t.recurrence?.frequency || 'monthly',
        interval: t.recurrence?.interval || 1,
        nextRun: t.date,
        endDate: t.recurrence?.endDate,
        occurrences: t.recurrence?.occurrences,
        isActive: true,
      }))
    return { recurring }
  },

  async createRecurring(payload) {
    await delay(400)
    const rule = {
      id: 'rec-' + Date.now(),
      userId: demoUser.id,
      ...payload,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    return { rule }
  },

  async updateRecurring(id, payload) {
    await delay(400)
    return { rule: { id, ...payload } }
  },

  async deleteRecurring(id) {
    await delay(300)
    return { ok: true }
  },

  async pauseRecurring(id) {
    await delay(300)
    return { ok: true }
  },

  async resumeRecurring(id) {
    await delay(300)
    return { ok: true }
  },

  // ---------------- Admin ----------------
  async getAdminUsers() {
    await delay(400)
    return { users: [demoUser] }
  },

  async getAdminStats() {
    await delay(400)
    return {
      totalUsers: 1,
      totalTransactions: demoTransactions.length,
      totalAmount: demoTransactions.reduce((sum, t) => sum + t.amount, 0),
    }
  },
}