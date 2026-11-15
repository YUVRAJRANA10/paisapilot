import mongoose from 'mongoose'
import { Category } from '../models/Category.js'
import { Transaction } from '../models/Transaction.js'
import { AppError } from '../middleware/errors.js'

function publicTransaction(transaction) {
  return {
    id: transaction._id.toString(),
    type: transaction.type,
    amountPaise: transaction.amountPaise,
    categoryId: transaction.categoryId.toString(),
    date: transaction.date.toISOString(),
    paymentMode: transaction.paymentMode,
    note: transaction.note,
    isRecurring: transaction.isRecurring,
    recurrence: transaction.recurrence,
  }
}

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction was not found.')
  }
}

export function createTransactionService({
  transactionModel = Transaction,
  categoryModel = Category,
} = {}) {
  async function findCategory(userId, categoryId) {
    assertId(categoryId)
    const category = await categoryModel.findOne({
      _id: categoryId,
      isArchived: false,
      $or: [{ userId }, { isSystem: true }],
    }).lean()
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category was not found.')
  }

  return {
    async list(userId, query) {
      const filter = { userId }
      if (query.type) filter.type = query.type
      if (query.categoryId) filter.categoryId = query.categoryId
      if (query.from || query.to) {
        filter.date = {}
        if (query.from) filter.date.$gte = new Date(query.from)
        if (query.to) filter.date.$lte = new Date(query.to)
      }
      const skip = (query.page - 1) * query.limit
      const [transactions, total] = await Promise.all([
        transactionModel.find(filter).sort({ date: -1, _id: -1 }).skip(skip).limit(query.limit).lean(),
        transactionModel.countDocuments(filter),
      ])
      return {
        data: transactions.map(publicTransaction),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    async create(userId, payload) {
      await findCategory(userId, payload.categoryId)
      const transaction = await transactionModel.create({
        ...payload,
        userId,
        date: new Date(payload.date),
      })
      return publicTransaction(transaction)
    },

    async update(userId, id, payload) {
      assertId(id)
      await findCategory(userId, payload.categoryId)
      const transaction = await transactionModel.findOneAndUpdate(
        { _id: id, userId },
        { ...payload, date: new Date(payload.date) },
        { new: true, runValidators: true },
      ).lean()
      if (!transaction) throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction was not found.')
      return publicTransaction(transaction)
    },

    async remove(userId, id) {
      assertId(id)
      const result = await transactionModel.deleteOne({ _id: id, userId })
      if (!result.deletedCount) throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction was not found.')
    },
  }
}
