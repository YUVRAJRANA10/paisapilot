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
  categoryById: id => `/api/categories/${id}`,
  transactions: '/api/transactions',
  transactionById: id => `/api/transactions/${id}`,
  transactionSummary: '/api/transactions/summary',
  budgets: '/api/budgets',
  budgetById: id => `/api/budgets/${id}`,
  budgetComparison: '/api/budgets/comparison',
  recurring: '/api/recurring',
  recurringById: id => `/api/recurring/${id}`,
  recurringPause: id => `/api/recurring/${id}/pause`,
  recurringResume: id => `/api/recurring/${id}/resume`,
  reports: {
    dashboard: '/api/reports/dashboard',
    categorySpending: '/api/reports/category-spending',
    monthlyTrend: '/api/reports/monthly-trend',
    exportCsv: '/api/reports/export/csv',
    exportPdf: '/api/reports/export/pdf',
  },
  admin: {
    users: '/api/admin/users',
    stats: '/api/admin/stats',
  },
}

export default ENDPOINTS