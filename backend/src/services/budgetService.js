import mongoose from 'mongoose'
import { Budget } from '../models/Budget.js'
import { Category } from '../models/Category.js'
import { Transaction } from '../models/Transaction.js'
import { AppError } from '../middleware/errors.js'
import { monthDateRange } from '../utils/timezone.js'

function publicBudget(budget, category, usedPaise) {
  const limitPaise = budget.limitPaise
  return {
    id: budget._id.toString(),
    categoryId: budget.categoryId.toString(),
    categoryName: category?.name || 'Archived category',
    month: budget.month,
    limitPaise,
    usedPaise,
    remainingPaise: limitPaise - usedPaise,
    utilizationPercent: limitPaise > 0 ? Number(((usedPaise / limitPaise) * 100).toFixed(2)) : 0,
  }
}

function assertCategoryId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found.')
  }
}

function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id
  if (mongoose.isValidObjectId(id)) return new mongoose.Types.ObjectId(id)
  return id
}

export function createBudgetService({
  budgetModel = Budget,
  categoryModel = Category,
  transactionModel = Transaction,
} = {}) {
  async function findCategory(userId, categoryId) {
    assertCategoryId(categoryId)
    const category = await categoryModel.findOne({
      _id: categoryId,
      isArchived: false,
      $or: [{ userId }, { isSystem: true }],
    }).lean()
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found.')
    return category
  }

  async function usageByCategory(userId, month, timezone) {
    const userObjectId = toObjectId(userId)
    const range = monthDateRange(month, timezone)
    if (!range) throw new AppError(400, 'VALIDATION_ERROR', 'The requested month is invalid.')
    const rows = await transactionModel.aggregate([
      { $match: { userId: userObjectId, type: 'expense', date: { $gte: range.from, $lt: range.to } } },
      { $group: { _id: '$categoryId', usedPaise: { $sum: '$amountPaise' } } },
    ])
    return new Map(rows.map(row => [row._id.toString(), row.usedPaise]))
  }

  return {
    async list(userId, month, timezone) {
      const budgets = await budgetModel.find({ userId, month }).sort({ categoryId: 1 }).lean()
      const categoryIds = budgets.map(budget => budget.categoryId)
      const categories = await categoryModel.find({ _id: { $in: categoryIds } }).lean()
      const categoryMap = new Map(categories.map(category => [category._id.toString(), category]))
      const usage = await usageByCategory(userId, month, timezone)
      return budgets.map(budget => publicBudget(
        budget,
        categoryMap.get(budget.categoryId.toString()),
        usage.get(budget.categoryId.toString()) || 0,
      ))
    },

    async upsert(userId, categoryId, payload, timezone) {
      const category = await findCategory(userId, categoryId)
      const budget = await budgetModel.findOneAndUpdate(
        { userId, categoryId, month: payload.month },
        { $set: { limitPaise: payload.limitPaise } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ).lean()
      const usage = await usageByCategory(userId, payload.month, timezone)
      return publicBudget(budget, category, usage.get(categoryId) || 0)
    },
  }
}
