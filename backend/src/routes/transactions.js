import { Router } from 'express'
import { Transaction } from '../models/Transaction.js'
import { Category } from '../models/Category.js'
import { requireAuth } from '../middleware/auth.js'

export function createTransactionsRouter() {
  const router = Router()
  router.use(requireAuth)

  router.get('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const { from, to, type, category, month, page = 1, limit = 50 } = req.query

      const query = { userId }
      if (type) query.type = type
      if (category) query.categoryId = category
      if (month) query.date = { $regex: `^${month}` }
      if (from || to) {
        query.date = query.date || {}
        if (from) query.date.$gte = from
        if (to) query.date.$lte = to
      }

      const pageNum = parseInt(page, 10) || 1
      const limitNum = parseInt(limit, 10) || 50
      const total = await Transaction.countDocuments(query)
      const transactions = await Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)

      res.json({
        transactions,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      })
    } catch (err) {
      next(err)
    }
  })

  router.get('/summary', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const { from, to } = req.query

      const query = { userId }
      if (from || to) {
        query.date = {}
        if (from) query.date.$gte = from
        if (to) query.date.$lte = to
      }

      const txns = await Transaction.find(query)
      let income = 0
      let expense = 0
      txns.forEach(t => {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      })

      const balance = income - expense
      const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

      res.json({
        income,
        expense,
        balance,
        savingsRate,
        transactionCount: txns.length,
      })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const payload = req.body

      let categoryName = payload.categoryName
      let categoryColor = payload.categoryColor
      if (!categoryName && payload.categoryId) {
        const cat = await Category.findOne({
          $or: [{ _id: payload.categoryId }, { id: payload.categoryId }]
        }).catch(() => null)
        if (cat) {
          categoryName = cat.name
          categoryColor = cat.color
        }
      }

      const transaction = await Transaction.create({
        userId,
        type: payload.type,
        amount: payload.amount,
        categoryId: payload.categoryId,
        categoryName: categoryName || 'Unknown',
        categoryColor: categoryColor || '#9ca3af',
        date: payload.date || new Date().toISOString(),
        paymentMode: payload.paymentMode || 'UPI',
        paymentAccount: payload.paymentAccount,
        note: payload.note || '',
        status: payload.status || 'cleared',
        isRecurring: !!payload.isRecurring,
      })

      res.status(201).json({ transaction })
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const filter = { userId }
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        filter._id = req.params.id
      } else {
        filter._id = req.params.id
      }
      const transaction = await Transaction.findOneAndUpdate(
        filter,
        { $set: req.body },
        { new: true }
      ).catch(() => null)
      if (!transaction) {
        return res.status(404).json({ error: { message: 'Transaction not found' } })
      }
      res.json({ transaction })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const filter = { userId }
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        filter._id = req.params.id
      } else {
        filter._id = req.params.id
      }
      await Transaction.deleteOne(filter).catch(() => null)
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  })

  return router
}
