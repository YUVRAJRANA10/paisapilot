import {
  DEMO_TRANSACTIONS,
  DEMO_CATEGORIES,
  DEMO_BUDGETS,
  DEMO_INSIGHTS,
  DEMO_CURRENT_MONTH,
} from './demoData'
import {
  calculateSavingsRate,
  getMonthsArray,
} from '../utils/format'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ---- Mutable in-memory demo state (copied so the originals stay untouched) ----
let demoAuthToken = typeof window !== 'undefined' ? localStorage.getItem('paisapilot_token') : null
let demoUser = null
if (typeof window !== 'undefined') {
  try {
    const savedUser = localStorage.getItem('paisapilot_user')
    if (savedUser) demoUser = JSON.parse(savedUser)
  } catch (e) {
    demoUser = null
  }
}
// ---- User persistent records ----
function getUserTransactions() {
  if (!demoUser) return []
  if (typeof window !== 'undefined') {
    try {
      const key = `paisapilot_txns_${demoUser.id || demoUser.email}`
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored)
    } catch (e) {}
  }
  return []
}

function saveUserTransactions(txns) {
  if (!demoUser) return
  if (typeof window !== 'undefined') {
    try {
      const key = `paisapilot_txns_${demoUser.id || demoUser.email}`
      localStorage.setItem(key, JSON.stringify(txns))
    } catch (e) {}
  }
}

function getUserBudgets() {
  if (!demoUser) return []
  if (typeof window !== 'undefined') {
    try {
      const key = `paisapilot_budgets_${demoUser.id || demoUser.email}`
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored)
    } catch (e) {}
  }
  return []
}

function saveUserBudgets(budgets) {
  if (!demoUser) return
  if (typeof window !== 'undefined') {
    try {
      const key = `paisapilot_budgets_${demoUser.id || demoUser.email}`
      localStorage.setItem(key, JSON.stringify(budgets))
    } catch (e) {}
  }
}

const CATEGORY_COLORS = [
  '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#14b8a6', '#6366f1', '#f97316', '#84cc16', '#06b6d4',
  '#10b981', '#006948',
]

function getUserCategories() {
  if (typeof window !== 'undefined') {
    try {
      const userKey = demoUser ? (demoUser.id || demoUser.email) : 'default'
      const key = `paisapilot_categories_${userKey}`
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored)
    } catch (e) {}
  }
  return [...DEMO_CATEGORIES]
}

function saveUserCategories(categories) {
  if (typeof window !== 'undefined') {
    try {
      const userKey = demoUser ? (demoUser.id || demoUser.email) : 'default'
      const key = `paisapilot_categories_${userKey}`
      localStorage.setItem(key, JSON.stringify(categories))
    } catch (e) {}
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

async function apiFetch(path, options = {}) {
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    const token = typeof window !== 'undefined' ? localStorage.getItem('paisapilot_token') : null
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {}
  return null
}

const demoCategories = [...DEMO_CATEGORIES]

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
    const apiRes = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (apiRes?.user && apiRes?.accessToken) {
      demoAuthToken = apiRes.accessToken
      demoUser = apiRes.user
      if (typeof window !== 'undefined') {
        localStorage.setItem('paisapilot_user', JSON.stringify(demoUser))
        localStorage.setItem('paisapilot_token', demoAuthToken)
      }
      return apiRes
    }
    await delay(200)
    demoAuthToken = 'demo-jwt-token-' + Date.now()
    const fullName = payload.name || payload.full_name || payload.username || ''
    const emailPrefix = payload.email ? payload.email.split('@')[0] : 'User'
    const name = fullName || emailPrefix
    demoUser = {
      id: 'user-' + Date.now(),
      name,
      full_name: name,
      username: payload.username || emailPrefix,
      user_metadata: {
        full_name: name,
        username: payload.username || emailPrefix,
      },
      email: payload.email,
      currency: payload.currency || 'INR',
      timezone: payload.timezone || 'Asia/Kolkata',
    }
    if (typeof window !== 'undefined') {
      try {
        const profiles = JSON.parse(localStorage.getItem('paisapilot_profiles') || '{}')
        if (payload.email) profiles[payload.email.toLowerCase()] = demoUser
        localStorage.setItem('paisapilot_profiles', JSON.stringify(profiles))
      } catch (e) {}
      localStorage.setItem('paisapilot_user', JSON.stringify(demoUser))
      localStorage.setItem('paisapilot_token', demoAuthToken)
    }
    return { user: demoUser, accessToken: demoAuthToken }
  },

  async authLogin(payload) {
    const apiRes = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (apiRes?.user && apiRes?.accessToken) {
      demoAuthToken = apiRes.accessToken
      demoUser = apiRes.user
      if (typeof window !== 'undefined') {
        localStorage.setItem('paisapilot_user', JSON.stringify(demoUser))
        localStorage.setItem('paisapilot_token', demoAuthToken)
      }
      return apiRes
    }
    await delay(200)
    demoAuthToken = 'demo-jwt-token-' + Date.now()
    let existingProfile = null
    if (typeof window !== 'undefined') {
      try {
        const profiles = JSON.parse(localStorage.getItem('paisapilot_profiles') || '{}')
        existingProfile = profiles[payload.email?.toLowerCase()]
      } catch (e) {}
    }
    if (existingProfile) {
      demoUser = existingProfile
    } else {
      const emailPrefix = payload.email ? payload.email.split('@')[0] : 'User'
      const name = payload.name || payload.full_name || emailPrefix
      demoUser = {
        id: 'user-' + Date.now(),
        name,
        full_name: name,
        username: payload.username || emailPrefix,
        user_metadata: {
          full_name: name,
          username: payload.username || emailPrefix,
        },
        email: payload.email || 'user@example.com',
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('paisapilot_user', JSON.stringify(demoUser))
      localStorage.setItem('paisapilot_token', demoAuthToken)
    }
    return { user: demoUser, accessToken: demoAuthToken }
  },

  async authLogout() {
    await apiFetch('/auth/logout', { method: 'POST' })
    await delay(100)
    demoAuthToken = null
    demoUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paisapilot_user')
      localStorage.removeItem('paisapilot_token')
    }
    return { ok: true }
  },

  async authMe() {
    const apiRes = await apiFetch('/auth/me')
    if (apiRes?.user) {
      demoUser = apiRes.user
      return apiRes
    }
    await delay(100)
    if (!demoAuthToken || !demoUser) throw new Error('Not authenticated')
    return { user: demoUser }
  },

  // ---------------- Categories ----------------
  async getCategories() {
    const apiRes = await apiFetch('/categories')
    if (apiRes?.categories?.length) {
      saveUserCategories(apiRes.categories)
      return { categories: apiRes.categories }
    }
    await delay(100)
    return { categories: getUserCategories() }
  },

  async createCategory(payload) {
    const apiRes = await apiFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (apiRes?.category) {
      const cats = getUserCategories()
      if (!cats.some(c => c.id === apiRes.category.id)) cats.push(apiRes.category)
      saveUserCategories(cats)
      return { category: apiRes.category }
    }
    await delay(100)
    const categories = getUserCategories()
    const name = (payload.name || '').trim()
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      return { category: existing }
    }
    const color = payload.color || CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
    const category = {
      id: 'cat-' + Date.now(),
      userId: demoUser?.id || 'user',
      name,
      color,
      icon: payload.icon || 'tag',
      budgetLimit: payload.budgetLimit || 0,
      ...payload,
    }
    categories.push(category)
    saveUserCategories(categories)
    return { category }
  },

  async updateCategory(id, payload) {
    await delay(150)
    const categories = getUserCategories()
    const idx = categories.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Category not found')
    categories[idx] = { ...categories[idx], ...payload }
    saveUserCategories(categories)
    return { category: categories[idx] }
  },

  async deleteCategory(id) {
    await delay(150)
    const categories = getUserCategories()
    const idx = categories.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Category not found')
    categories.splice(idx, 1)
    saveUserCategories(categories)
    return { ok: true }
  },

  // ---------------- Transactions ----------------
  async getTransactions(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, v) })
    const apiRes = await apiFetch(`/transactions?${query.toString()}`)
    if (apiRes?.transactions) {
      const localTxns = getUserTransactions()
      const unsynced = localTxns.filter(lt => lt.id && !lt.id.match(/^[0-9a-fA-F]{24}$/))
      if (unsynced.length > 0) {
        for (const t of unsynced) {
          await apiFetch('/transactions', {
            method: 'POST',
            body: JSON.stringify({
              type: t.type,
              amount: t.amount,
              categoryId: t.categoryId,
              categoryName: t.categoryName,
              categoryColor: t.categoryColor,
              date: t.date,
              paymentMode: t.paymentMode,
              note: t.note,
            }),
          })
        }
        saveUserTransactions(apiRes.transactions)
      }
      return apiRes
    }
    await delay(150)
    let filtered = [...getUserTransactions()]
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
    if (params.month) {
      filtered = filtered.filter(t => t.date.startsWith(params.month))
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
    const apiRes = await apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (apiRes?.transaction) {
      const txns = getUserTransactions()
      txns.unshift(apiRes.transaction)
      saveUserTransactions(txns)
      return { transaction: apiRes.transaction }
    }
    await delay(150)
    const cat = getUserCategories().find(c => c.id === payload.categoryId)
    const transaction = {
      id: 'txn-' + Date.now(),
      userId: demoUser?.id || 'user',
      categoryName: cat ? cat.name : (payload.categoryName || 'Unknown'),
      categoryColor: cat ? cat.color : (payload.categoryColor || '#9ca3af'),
      status: 'cleared',
      ...payload,
    }
    const txns = getUserTransactions()
    txns.unshift(transaction)
    saveUserTransactions(txns)
    return { transaction }
  },

  async updateTransaction(id, payload) {
    if (id) {
      await apiFetch(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    }
    await delay(150)
    const txns = getUserTransactions()
    const idx = txns.findIndex(t => t.id === id || t._id === id)
    if (idx !== -1) {
      txns[idx] = { ...txns[idx], ...payload }
      saveUserTransactions(txns)
      return { transaction: txns[idx] }
    }
    return { transaction: payload }
  },

  async deleteTransaction(id) {
    if (id) {
      await apiFetch(`/transactions/${id}`, {
        method: 'DELETE',
      })
    }
    await delay(150)
    const txns = getUserTransactions()
    const idx = txns.findIndex(t => t.id === id || t._id === id)
    if (idx !== -1) {
      txns.splice(idx, 1)
      saveUserTransactions(txns)
    }
    return { ok: true }
  },

  async getTransactionSummary(params = {}) {
    await delay(200)
    const { from, to } = params
    let filtered = getUserTransactions()
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
    const query = new URLSearchParams()
    if (params.month) query.set('month', params.month)
    const apiRes = await apiFetch(`/budgets?${query.toString()}`)
    if (apiRes?.budgets) {
      return apiRes
    }
    await delay(150)
    const txns = getUserTransactions()
    let budgets = getUserBudgets()
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const targetMonth = params.month || currentMonthStr

    // If zero budget records exist for this user and month, seed default categories with ₹0 limit
    const monthBudgets = budgets.filter(b => b.month === targetMonth)
    if (monthBudgets.length === 0 && demoUser) {
      const defaultCategories = [
        { id: 'cat-1', name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
        { id: 'cat-2', name: 'Transport', color: '#3b82f6', icon: 'car' },
        { id: 'cat-3', name: 'Shopping', color: '#8b5cf6', icon: 'shopping-bag' },
        { id: 'cat-4', name: 'Entertainment', color: '#ec4899', icon: 'film' },
        { id: 'cat-5', name: 'Bills & Utilities', color: '#f59e0b', icon: 'file-text' },
        { id: 'cat-6', name: 'Healthcare', color: '#14b8a6', icon: 'heart-pulse' },
      ]
      const seeded = defaultCategories.map(cat => ({
        id: `bud-${cat.id}-${targetMonth}`,
        userId: demoUser.id,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        limit: 0,
        month: targetMonth,
      }))
      budgets = [...budgets, ...seeded]
      saveUserBudgets(budgets)
    }

    const categories = getUserCategories()
    let filtered = budgets.map(budget => {
      const cat = categories.find(c => c.id === budget.categoryId)
      return {
        ...budget,
        categoryName: budget.categoryName || (cat ? cat.name : 'Unknown'),
        categoryColor: budget.categoryColor || (cat ? cat.color : '#006948'),
        used: txns
          .filter(transaction =>
            transaction.type === 'expense' &&
            transaction.categoryId === budget.categoryId &&
            (!params.month || transaction.date.startsWith(params.month))
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      }
    })
    if (params.month) {
      filtered = filtered.filter(b => b.month === params.month)
    }
    return { budgets: filtered }
  },

  async createBudget(payload) {
    const apiRes = await apiFetch('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (apiRes?.budget) {
      const budgets = getUserBudgets()
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const month = payload.month || currentMonthStr
      const existingIdx = budgets.findIndex(b => b.categoryId === payload.categoryId && b.month === month)
      if (existingIdx !== -1) {
        budgets[existingIdx] = apiRes.budget
      } else {
        budgets.push(apiRes.budget)
      }
      saveUserBudgets(budgets)
      return { budget: apiRes.budget }
    }
    await delay(150)
    const budgets = getUserBudgets()
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const month = payload.month || currentMonthStr
    const existingIdx = budgets.findIndex(b => b.categoryId === payload.categoryId && b.month === month)
    const categories = getUserCategories()
    const cat = categories.find(c => c.id === payload.categoryId)
    if (existingIdx !== -1) {
      budgets[existingIdx] = {
        ...budgets[existingIdx],
        ...payload,
        categoryName: payload.categoryName || (cat ? cat.name : budgets[existingIdx].categoryName),
        categoryColor: payload.categoryColor || (cat ? cat.color : budgets[existingIdx].categoryColor),
        month,
      }
      saveUserBudgets(budgets)
      return { budget: budgets[existingIdx] }
    }
    const budget = {
      id: 'bud-' + Date.now(),
      userId: demoUser?.id || 'user',
      categoryId: payload.categoryId,
      categoryName: payload.categoryName || (cat ? cat.name : 'Unknown'),
      categoryColor: payload.categoryColor || (cat ? cat.color : '#9ca3af'),
      limit: payload.limit || 0,
      month,
      ...payload,
    }
    budgets.push(budget)
    saveUserBudgets(budgets)
    return { budget }
  },

  async updateBudget(id, payload) {
    await delay(100)
    const budgets = getUserBudgets()
    const idx = budgets.findIndex(b => b.id === id)
    if (idx !== -1) {
      budgets[idx] = { ...budgets[idx], ...payload }
      saveUserBudgets(budgets)
      return { budget: budgets[idx] }
    } else {
      const catIdx = budgets.findIndex(b => b.categoryId === payload.categoryId && b.month === payload.month)
      if (catIdx !== -1) {
        budgets[catIdx] = { ...budgets[catIdx], ...payload }
        saveUserBudgets(budgets)
        return { budget: budgets[catIdx] }
      }
      const newBudget = {
        id: id || 'bud-' + Date.now(),
        userId: demoUser?.id || 'user',
        ...payload,
      }
      budgets.push(newBudget)
      saveUserBudgets(budgets)
      return { budget: newBudget }
    }
  },

  async deleteBudget(id) {
    await delay(100)
    const budgets = getUserBudgets()
    const idx = budgets.findIndex(b => b.id === id)
    if (idx !== -1) {
      budgets.splice(idx, 1)
      saveUserBudgets(budgets)
    }
    return { ok: true }
  },

  // ---------------- Reports ----------------
  async getDashboardReport(params = {}) {
    const query = new URLSearchParams()
    if (params.month) query.set('month', params.month)
    const apiRes = await apiFetch(`/reports/dashboard?${query.toString()}`)
    if (apiRes?.monthlyTrend) {
      return apiRes
    }
    await delay(200)
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const targetMonth = params.month || currentMonthStr
    const userTxns = getUserTransactions()
    const monthTransactions = userTxns.filter(t => t.date.startsWith(targetMonth))
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
    const categories = getUserCategories()
    const categorySpendingArray = Object.entries(categorySpending)
      .map(([categoryId, total]) => {
        const cat = categories.find(c => c.id === categoryId)
        return {
          categoryId,
          categoryName: cat ? cat.name : 'Unknown',
          categoryColor: cat ? cat.color : '#9ca3af',
          total,
          count: monthTransactions.filter(t => t.categoryId === categoryId).length,
        }
      })
      .sort((a, b) => b.total - a.total)
    const categoryTotal = categorySpendingArray.reduce((sum, item) => sum + item.total, 0)
    categorySpendingArray.forEach(item => {
      item.percentage = categoryTotal > 0 ? (item.total / categoryTotal) * 100 : 0
    })

    const monthlyTrend = getMonthsArray(6, `${targetMonth}-01`).map(m => {
      const monthTxns = userTxns.filter(t => t.date.startsWith(m.key))
      let mIncome = 0
      let mExpense = 0
      monthTxns.forEach(t => {
        if (t.type === 'income') mIncome += t.amount
        else mExpense += t.amount
      })
      return { key: m.key, label: m.label, income: mIncome, expense: mExpense, balance: mIncome - mExpense }
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
    await delay(100)
    return { insights: [] }
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
    return { users: demoUser ? [demoUser] : [] }
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