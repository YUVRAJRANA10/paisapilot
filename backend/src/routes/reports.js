import { Router } from 'express'
import { Transaction } from '../models/Transaction.js'
import { Category } from '../models/Category.js'
import { requireAuth } from '../middleware/auth.js'

export function createReportsRouter() {
  const router = Router()
  router.use(requireAuth)

  router.get('/dashboard', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const targetMonth = req.query.month || currentMonthStr

      const userTxns = await Transaction.find({ userId })
      const monthTransactions = userTxns.filter(t => t.date.startsWith(targetMonth))

      let income = 0
      let expense = 0
      monthTransactions.forEach(t => {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      })
      const balance = income - expense
      const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

      const categorySpendingMap = {}
      monthTransactions.forEach(t => {
        if (t.type === 'expense') {
          categorySpendingMap[t.categoryId] = (categorySpendingMap[t.categoryId] || 0) + t.amount
        }
      })

      const categories = await Category.find({ userId })
      const categorySpending = Object.entries(categorySpendingMap).map(([categoryId, total]) => {
        const cat = categories.find(c => c.id === categoryId || c._id.toString() === categoryId)
        return {
          categoryId,
          categoryName: cat ? cat.name : 'Unknown',
          categoryColor: cat ? cat.color : '#9ca3af',
          total,
          count: monthTransactions.filter(t => t.categoryId === categoryId).length,
        }
      }).sort((a, b) => b.total - a.total)

      const categoryTotal = categorySpending.reduce((sum, item) => sum + item.total, 0)
      categorySpending.forEach(item => {
        item.percentage = categoryTotal > 0 ? (item.total / categoryTotal) * 100 : 0
      })

      // Generate 6 months trend
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('en-US', { month: 'short' })
        const mTxns = userTxns.filter(t => t.date.startsWith(key))
        let mIncome = 0
        let mExpense = 0
        mTxns.forEach(t => {
          if (t.type === 'income') mIncome += t.amount
          else mExpense += t.amount
        })
        monthlyTrend.push({
          key,
          label,
          income: mIncome,
          expense: mExpense,
          balance: mIncome - mExpense,
        })
      }

      res.json({
        income,
        expense,
        balance,
        savingsRate,
        categorySpending,
        monthlyTrend,
      })
    } catch (err) {
      next(err)
    }
  })

  return router
}
