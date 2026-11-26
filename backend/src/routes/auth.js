import { Router } from 'express'
import { User } from '../models/User.js'
import { Category } from '../models/Category.js'
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

      // Seed initial default categories for this user if not present
      const existingCategories = await Category.countDocuments({ userId: user.id })
      if (existingCategories === 0) {
        await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
          userId: user.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budgetLimit: c.budgetLimit,
        })))
      }

      const accessToken = signToken({
        id: user.id,
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

      const existingCategories = await Category.countDocuments({ userId: user.id })
      if (existingCategories === 0) {
        await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
          userId: user.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budgetLimit: c.budgetLimit,
        })))
      }

      const accessToken = signToken({
        id: user.id,
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
      if (user.id) {
        const dbUser = await User.findById(user.id)
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
