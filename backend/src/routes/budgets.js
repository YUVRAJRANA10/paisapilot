import { Router } from 'express'
import { Budget } from '../models/Budget.js'
import { Category } from '../models/Category.js'
import { Transaction } from '../models/Transaction.js'
import { requireAuth } from '../middleware/auth.js'

export function createBudgetsRouter() {
  const router = Router()
  router.use(requireAuth)

  router.get('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const targetMonth = req.query.month || currentMonthStr

      let budgets = await Budget.find({ userId, month: targetMonth })

      // Seed 6 default category budgets with limit 0 if 0 records exist
      if (budgets.length === 0) {
        let categories = await Category.find({ userId }).limit(6)
        if (categories.length === 0) {
          const defaultCategories = [
            { name: 'Food & Dining', color: '#ef4444' },
            { name: 'Transport', color: '#3b82f6' },
            { name: 'Shopping', color: '#8b5cf6' },
            { name: 'Entertainment', color: '#ec4899' },
            { name: 'Bills & Utilities', color: '#f59e0b' },
            { name: 'Healthcare', color: '#14b8a6' },
          ]
          categories = await Category.insertMany(defaultCategories.map(c => ({
            userId,
            name: c.name,
            color: c.color,
          })))
        }

        const seeded = categories.map(cat => ({
          userId,
          categoryId: cat.id || cat._id.toString(),
          categoryName: cat.name,
          categoryColor: cat.color,
          limit: 0,
          month: targetMonth,
        }))
        budgets = await Budget.insertMany(seeded)
      }

      // Fetch expenses for this month to calculate used
      const monthTransactions = await Transaction.find({
        userId,
        type: 'expense',
        date: { $regex: `^${targetMonth}` },
      })

      const budgetsWithUsed = budgets.map(b => {
        const bObj = b.toJSON()
        bObj.used = monthTransactions
          .filter(t => t.categoryId === bObj.categoryId)
          .reduce((sum, t) => sum + t.amount, 0)
        return bObj
      })

      res.json({ budgets: budgetsWithUsed })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const { categoryId, categoryName, categoryColor, limit, month } = req.body
      const now = new Date()
      const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      let name = categoryName
      let color = categoryColor
      if (!name && categoryId) {
        const cat = await Category.findOne({
          $or: [{ _id: categoryId }, { id: categoryId }]
        }).catch(() => null)
        if (cat) {
          name = cat.name
          color = cat.color
        }
      }

      let budget = await Budget.findOne({ userId, categoryId, month: targetMonth })
      if (budget) {
        budget.limit = limit !== undefined ? limit : budget.limit
        if (name) budget.categoryName = name
        if (color) budget.categoryColor = color
        await budget.save()
      } else {
        budget = await Budget.create({
          userId,
          categoryId,
          categoryName: name || 'Unknown',
          categoryColor: color || '#006948',
          limit: limit || 0,
          month: targetMonth,
        })
      }

      res.status(201).json({ budget })
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId },
        { $set: req.body },
        { new: true }
      )
      if (!budget) {
        return res.status(404).json({ error: { message: 'Budget not found' } })
      }
      res.json({ budget })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      await Budget.deleteOne({ _id: req.params.id, userId })
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  })

  return router
}
