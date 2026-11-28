import { Router } from 'express'
import { User } from '../models/User.js'
import { Category } from '../models/Category.js'
import { Budget } from '../models/Budget.js'
import { signToken } from '../utils/token.js'
import { requireAuth } from '../middleware/auth.js'
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories.js'

export function createAuthRouter() {
  const router = Router()

  router.post('/register', async (req, res, next) => {
    try {
      const { email, name, full_name, username, currency, timezone, password } = req.body
      if (!email) {
        return res.status(400).json({ error: { message: 'Email is required' } })
      }

      const emailPrefix = email.split('@')[0]
      const displayName = name || full_name || username || emailPrefix

      let user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          name: displayName,
          full_name: displayName,
          username: username || emailPrefix,
          currency: currency || 'INR',
          timezone: timezone || 'Asia/Kolkata',
        })
      }

      const userId = user.id || user._id.toString()

      // Seed initial default categories for this user if not present
      const existingCategories = await Category.countDocuments({ userId })
      let categories = []
      if (existingCategories === 0) {
        categories = await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
          userId,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budgetLimit: c.budgetLimit,
        })))
      } else {
        categories = await Category.find({ userId })
      }

      // Seed initial budgets if not present
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const existingBudgets = await Budget.countDocuments({ userId, month: currentMonthStr })
      if (existingBudgets === 0 && categories.length > 0) {
        const defaultLimits = {
          'Food & Dining': 1500000,
          'Transport': 800000,
          'Shopping': 1000000,
          'Bills & Utilities': 700000,
          'Entertainment': 500000,
          'Healthcare': 500000,
        }
        await Budget.insertMany(categories.slice(0, 6).map(cat => ({
          userId,
          categoryId: cat.id || cat._id.toString(),
          categoryName: cat.name,
          categoryColor: cat.color,
          limit: defaultLimits[cat.name] || 500000,
          limitPaise: defaultLimits[cat.name] || 500000,
          month: currentMonthStr,
        }))).catch(() => {})
      }

      const accessToken = signToken({
        id: userId,
        email: user.email,
        name: user.name,
      })

      const userJson = user.toJSON()
      userJson.user_metadata = { full_name: user.name, username: user.username }

      res.status(201).json({ user: userJson, accessToken })
    } catch (err) {
      next(err)
    }
  })

  router.post('/login', async (req, res, next) => {
    try {
      const { email, name, full_name } = req.body
      if (!email) {
        return res.status(400).json({ error: { message: 'Email is required' } })
      }

      let user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        const emailPrefix = email.split('@')[0]
        const displayName = name || full_name || emailPrefix
        user = await User.create({
          email: email.toLowerCase(),
          name: displayName,
          full_name: displayName,
          username: emailPrefix,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        })
      }

      const userId = user.id || user._id.toString()

      // Seed initial default categories if not present
      const existingCategories = await Category.countDocuments({ userId })
      let categories = []
      if (existingCategories === 0) {
        categories = await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
          userId,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budgetLimit: c.budgetLimit,
        })))
      } else {
        categories = await Category.find({ userId })
      }

      // Seed initial budgets if not present
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const existingBudgets = await Budget.countDocuments({ userId, month: currentMonthStr })
      if (existingBudgets === 0 && categories.length > 0) {
        const defaultLimits = {
          'Food & Dining': 1500000,
          'Transport': 800000,
          'Shopping': 1000000,
          'Bills & Utilities': 700000,
          'Entertainment': 500000,
          'Healthcare': 500000,
        }
        await Budget.insertMany(categories.slice(0, 6).map(cat => ({
          userId,
          categoryId: cat.id || cat._id.toString(),
          categoryName: cat.name,
          categoryColor: cat.color,
          limit: defaultLimits[cat.name] || 500000,
          limitPaise: defaultLimits[cat.name] || 500000,
          month: currentMonthStr,
        }))).catch(() => {})
      }

      const accessToken = signToken({
        id: userId,
        email: user.email,
        name: user.name,
      })

      const userJson = user.toJSON()
      userJson.user_metadata = { full_name: user.name, username: user.username }

      res.json({ user: userJson, accessToken })
    } catch (err) {
      next(err)
    }
  })

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      let user = req.user
      if (user.id && user.id.match(/^[0-9a-fA-F]{24}$/)) {
        const dbUser = await User.findById(user.id).catch(() => null)
        if (dbUser) user = dbUser
      } else if (user.email) {
        const dbUser = await User.findOne({ email: user.email.toLowerCase() }).catch(() => null)
        if (dbUser) user = dbUser
      }
      const userJson = typeof user.toJSON === 'function' ? user.toJSON() : user
      userJson.user_metadata = { full_name: user.name || user.full_name, username: user.username }
      res.json({ user: userJson })
    } catch (err) {
      next(err)
    }
  })

  router.post('/logout', (req, res) => {
    res.json({ ok: true })
  })

  return router
}
