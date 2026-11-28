import { Router } from 'express'
import { Category } from '../models/Category.js'
import { requireAuth } from '../middleware/auth.js'
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories.js'

const CATEGORY_COLORS = [
  '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#14b8a6', '#6366f1', '#f97316', '#84cc16', '#06b6d4',
  '#10b981', '#006948',
]

export function createCategoriesRouter() {
  const router = Router()
  router.use(requireAuth)

  router.get('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      let categories = await Category.find({ userId })

      if (categories.length === 0) {
        categories = await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
          userId,
          name: c.name,
          icon: c.icon,
          color: c.color,
          budgetLimit: c.budgetLimit,
        })))
      }

      res.json({ categories, data: categories })
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const { name, color, icon, budgetLimit } = req.body

      const trimmedName = (name || '').trim()
      if (!trimmedName) {
        return res.status(400).json({ error: { message: 'Category name is required' } })
      }

      const existing = await Category.findOne({
        userId,
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
      })
      if (existing) {
        return res.json({ category: existing, data: existing })
      }

      const count = await Category.countDocuments({ userId })
      const assignedColor = color || CATEGORY_COLORS[count % CATEGORY_COLORS.length]

      const category = await Category.create({
        userId,
        name: trimmedName,
        color: assignedColor,
        icon: icon || 'tag',
        budgetLimit: budgetLimit || 0,
      })

      res.status(201).json({ category, data: category })
    } catch (err) {
      next(err)
    }
  })

  const handleUpdate = async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const filter = { userId }
      if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        filter._id = req.params.id
      } else {
        filter.id = req.params.id
      }
      const category = await Category.findOneAndUpdate(
        filter,
        { $set: req.body },
        { new: true }
      )
      res.json({ category, data: category })
    } catch (err) {
      next(err)
    }
  }

  router.put('/:id', handleUpdate)
  router.patch('/:id', handleUpdate)

  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const filter = { userId }
      if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        filter._id = req.params.id
      } else {
        filter.id = req.params.id
      }
      await Category.findOneAndDelete(filter)
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  })

  return router
}
