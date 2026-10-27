import axios from 'axios'

// Real API client — used when VITE_DEMO_MODE is not 'true'
// This module exports the same async function signatures as demoAdapter.js
// so pages can swap implementations without rewriting UI code.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('paisapilot_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: handle 401 by attempting refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('paisapilot_refresh_token')
        const { data } = await apiClient.post('/auth/refresh', { refreshToken })
        localStorage.setItem('paisapilot_token', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('paisapilot_token')
        localStorage.removeItem('paisapilot_refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  authRegister: payload => apiClient.post('/auth/register', payload),
  authLogin: payload => apiClient.post('/auth/login', payload),
  authRefresh: () => apiClient.post('/auth/refresh'),
  authLogout: () => apiClient.post('/auth/logout'),
  authMe: () => apiClient.get('/auth/me'),

  // User preferences
  userPreferences: () => apiClient.get('/user/preferences'),
  updatePreferences: payload => apiClient.patch('/user/preferences', payload),

  // Categories
  getCategories: () => apiClient.get('/categories'),
  createCategory: payload => apiClient.post('/categories', payload),
  updateCategory: (id, payload) => apiClient.patch(`/categories/${id}`, payload),
  deleteCategory: id => apiClient.delete(`/categories/${id}`),

  // Transactions
  getTransactions: params => apiClient.get('/transactions', { params }),
  createTransaction: payload => apiClient.post('/transactions', payload),
  updateTransaction: (id, payload) => apiClient.patch(`/transactions/${id}`, payload),
  deleteTransaction: id => apiClient.delete(`/transactions/${id}`),
  getTransactionSummary: params => apiClient.get('/transactions/summary', { params }),

  // Budgets
  getBudgets: params => apiClient.get('/budgets', { params }),
  createBudget: payload => apiClient.post('/budgets', payload),
  updateBudget: (id, payload) => apiClient.patch(`/budgets/${id}`, payload),
  deleteBudget: id => apiClient.delete(`/budgets/${id}`),
  getBudgetComparison: params => apiClient.get('/budgets/comparison', { params }),

  // Reports
  getDashboardReport: params => apiClient.get('/reports/dashboard', { params }),
  getCategorySpending: params => apiClient.get('/reports/category-spending', { params }),
  getMonthlyTrend: params => apiClient.get('/reports/monthly-trend', { params }),
  exportCsv: params => apiClient.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPdf: params => apiClient.get('/reports/export/pdf', { params, responseType: 'blob' }),

  // Recurring
  getRecurring: () => apiClient.get('/recurring'),
  createRecurring: payload => apiClient.post('/recurring', payload),
  updateRecurring: (id, payload) => apiClient.patch(`/recurring/${id}`, payload),
  deleteRecurring: id => apiClient.delete(`/recurring/${id}`),
  pauseRecurring: id => apiClient.post(`/recurring/${id}/pause`),
  resumeRecurring: id => apiClient.post(`/recurring/${id}/resume`),

  // Admin
  getAdminUsers: () => apiClient.get('/admin/users'),
  getAdminStats: () => apiClient.get('/admin/stats'),
}

export default api