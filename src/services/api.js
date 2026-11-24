const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) return null
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Request failed.')
    error.status = response.status
    error.code = body.error?.code
    error.fields = body.error?.fields
    throw error
  }
  return body
}

const toPaise = amount => Math.round(Number(amount || 0) * 100)
const fromTransaction = transaction => ({
  ...transaction,
  amount: transaction.amountPaise,
  categoryName: transaction.categoryName,
})
const paymentMode = value => ({
  UPI: 'upi',
  'Google Pay': 'upi',
  PhonePe: 'upi',
  Paytm: 'upi',
  'Credit Card': 'card',
  'Debit Card': 'card',
  'Net Banking': 'bank_transfer',
  Cash: 'cash',
  Wallet: 'other',
  Other: 'other',
}[value] || value)
const fromBudget = budget => ({
  ...budget,
  limit: budget.limitPaise,
  used: budget.usedPaise,
})

export const api = {
  authRegister: payload => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      monthlyIncomePaise: payload.monthlyIncomePaise ?? toPaise(payload.monthlyIncome),
    }),
  }),
  authLogin: payload => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  authLogout: () => request('/auth/logout', { method: 'POST' }),
  authMe: () => request('/auth/me'),
  getPreferences: () => request('/user/preferences'),
  updatePreferences: payload => request('/user/preferences', { method: 'PATCH', body: JSON.stringify(payload) }),

  getCategories: async () => {
    const result = await request('/categories')
    return { categories: result.data }
  },
  createCategory: payload => request('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: id => request(`/categories/${id}`, { method: 'DELETE' }),

  getTransactions: async params => {
    const query = new URLSearchParams()
    const categoryId = params?.category || params?.categoryId
    const allowed = {
      page: params?.page,
      limit: params?.limit,
      type: params?.type,
      from: params?.from,
      to: params?.to,
      categoryId,
    }
    Object.entries(allowed).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, value)
    })
    const result = await request(`/transactions?${query}`)
    return {
      transactions: result.data.map(fromTransaction),
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    }
  },
  createTransaction: payload => {
    const { id, amount, date, ...fields } = payload
    return request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      ...fields,
      date: new Date(date).toISOString(),
      amountPaise: payload.amountPaise ?? amount,
      paymentMode: paymentMode(fields.paymentMode),
    }),
  }).then(result => ({ transaction: fromTransaction(result.transaction) }))
  },
  updateTransaction: (id, payload) => {
    const { id: ignoredId, amount, date, ...fields } = payload
    return request(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...fields,
      date: new Date(date).toISOString(),
      amountPaise: payload.amountPaise ?? amount,
      paymentMode: paymentMode(fields.paymentMode),
    }),
  }).then(result => ({ transaction: fromTransaction(result.transaction) }))
  },
  deleteTransaction: id => request(`/transactions/${id}`, { method: 'DELETE' }),

  getBudgets: async params => {
    const result = await request(`/budgets?month=${encodeURIComponent(params.month)}`)
    return { budgets: result.budgets.map(fromBudget) }
  },
  updateBudget: (categoryId, payload) => request(`/budgets/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then(result => ({ budget: fromBudget(result.budget) })),

  getDashboardReport: async ({ month }) => {
    const [year, monthNumber] = month.split('-').map(Number)
    const lastDay = new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999)).toISOString()
    const [summary, categories, trend] = await Promise.all([
      request(`/reports/summary?month=${encodeURIComponent(month)}`),
      request(`/reports/by-category?from=${encodeURIComponent(`${month}-01T00:00:00.000Z`)}&to=${encodeURIComponent(lastDay)}`),
      request(`/reports/monthly-trend?year=${month.slice(0, 4)}`),
    ])
    const totalExpensePaise = summary?.summary?.expensePaise || 0
    return {
      ...summary.summary,
      income: summary.summary.incomePaise,
      expense: summary.summary.expensePaise,
      balance: summary.summary.balancePaise,
      categorySpending: (categories?.categories || []).map(item => ({
        ...item,
        name: item.categoryName,
        total: item.totalPaise,
        value: item.totalPaise,
        percentage: totalExpensePaise > 0 ? (item.totalPaise / totalExpensePaise) * 100 : 0,
      })),
      monthlyTrend: (trend?.months || []).map(item => ({
        ...item,
        income: item.incomePaise,
        expense: item.expensePaise,
        balance: item.balancePaise,
        label: item.month,
      })),
    }
  },
  getMonthlyTrend: async ({ year }) => request(`/reports/monthly-trend?year=${year}`),
  exportReport: async ({ from, to }) => {
    const query = new URLSearchParams({ from, to, format: 'csv' })
    const response = await fetch(`${API_BASE_URL}/reports/export?${query}`, {
      credentials: 'include',
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error?.message || 'Could not export report.')
    }
    return response.blob()
  },
}

export default api
