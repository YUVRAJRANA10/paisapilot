import api from './api'

export const realAdapter = {
  authRegister: payload => api.authRegister(payload),
  authLogin: payload => api.authLogin(payload),
  authLogout: () => api.authLogout(),
  authMe: () => api.authMe(),
  getCategories: () => api.getCategories(),
  createCategory: payload => api.createCategory(payload),
  updateCategory: (id, payload) => api.updateCategory(id, payload),
  deleteCategory: id => api.deleteCategory(id),
  getTransactions: params => api.getTransactions(params),
  createTransaction: payload => api.createTransaction(payload),
  updateTransaction: (id, payload) => api.updateTransaction(id, payload),
  deleteTransaction: id => api.deleteTransaction(id),
  getBudgets: params => api.getBudgets(params),
  updateBudget: (categoryId, payload) => api.updateBudget(categoryId, payload),
  getDashboardReport: params => api.getDashboardReport(params),
  updatePreferences: payload => api.updatePreferences(payload),
  exportReport: params => api.exportReport(params),
}
