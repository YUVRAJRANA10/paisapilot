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

      res.json({ categories })
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
        return res.json({ category: existing })
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

      res.status(201).json({ category })
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      const category = await Category.findOneAndUpdate(
        { _id: req.params.id, userId },
        { $set: req.body },
        { new: true }
      )
      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } })
      }
      res.json({ category })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.user.id || req.user._id
      await Category.deleteOne({ _id: req.params.id, userId })
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  })

  return router
}
