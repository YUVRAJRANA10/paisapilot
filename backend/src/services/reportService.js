import mongoose from 'mongoose'
import { Transaction } from '../models/Transaction.js'
import { monthDateRange, yearDateRange } from '../utils/timezone.js'
import { AppError } from '../middleware/errors.js'

function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id
  if (mongoose.isValidObjectId(id)) return new mongoose.Types.ObjectId(id)
  return id
}

function assertRange(range) {
  if (!range) throw new AppError(400, 'VALIDATION_ERROR', 'The requested date range is invalid.')
}

export function createReportService({ transactionModel = Transaction } = {}) {
  return {
    async exportCsv(userId, from, to) {
      const userObjectId = toObjectId(userId)
      const start = new Date(from)
      const end = new Date(to)
      const transactions = await transactionModel.find({
        userId: userObjectId,
        date: { $gte: start, $lte: end },
      }).populate('categoryId', 'name').sort({ date: -1, _id: -1 }).lean()

      const escapeCsv = value => {
        let text = String(value ?? '')
        if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
        return `"${text.replaceAll('"', '""')}"`
      }

      const rows = [
        ['Date', 'Type', 'Category', 'Amount (paise)', 'Payment mode', 'Note'],
        ...transactions.map(transaction => [
          transaction.date.toISOString(),
          transaction.type,
          transaction.categoryId?.name || 'Archived category',
          transaction.amountPaise,
          transaction.paymentMode,
          transaction.note || '',
        ]),
      ]
      return rows.map(row => row.map(escapeCsv).join(',')).join('\r\n') + '\r\n'
    },
    async summary(userId, month, timezone) {
      const userObjectId = toObjectId(userId)
      const range = monthDateRange(month, timezone)
      assertRange(range)
      const [result] = await transactionModel.aggregate([
        { $match: { userId: userObjectId, date: { $gte: range.from, $lt: range.to } } },
        {
          $facet: {
            totals: [
              { $group: {
                _id: '$type',
                totalPaise: { $sum: '$amountPaise' },
              } },
            ],
            count: [{ $count: 'value' }],
          },
        },
      ])
      const incomePaise = result?.totals?.find(item => item._id === 'income')?.totalPaise || 0
      const expensePaise = result?.totals?.find(item => item._id === 'expense')?.totalPaise || 0
      return {
        incomePaise,
        expensePaise,
        balancePaise: incomePaise - expensePaise,
        savingsRate: incomePaise > 0 ? Number((((incomePaise - expensePaise) / incomePaise) * 100).toFixed(2)) : 0,
        transactionCount: result?.count?.[0]?.value || 0,
      }
    },

    async byCategory(userId, from, to) {
      const userObjectId = toObjectId(userId)
      const start = new Date(from)
      const end = new Date(to)
      const [rows] = await Promise.all([
        transactionModel.aggregate([
          { $match: { userId: userObjectId, type: 'expense', date: { $gte: start, $lte: end } } },
          { $group: { _id: '$categoryId', totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $project: {
            _id: 0,
            categoryId: '$_id',
            categoryName: { $ifNull: ['$category.name', 'Archived category'] },
            totalPaise: 1,
            count: 1,
          } },
          { $sort: { totalPaise: -1, categoryName: 1 } },
        ]),
      ])
      return rows.map(row => ({ ...row, categoryId: row.categoryId.toString() }))
    },

    async monthlyTrend(userId, year, timezone) {
      const userObjectId = toObjectId(userId)
      const range = yearDateRange(year, timezone)
      assertRange(range)
      const rows = await transactionModel.aggregate([
        { $match: { userId: userObjectId, date: { $gte: range.from, $lt: range.to } } },
        { $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date', timezone } },
            type: '$type',
          },
          totalPaise: { $sum: '$amountPaise' },
        } },
        { $sort: { '_id.month': 1 } },
        { $group: {
          _id: '$_id.month',
          values: { $push: { type: '$_id.type', totalPaise: '$totalPaise' } },
        } },
        { $project: {
          _id: 0,
          month: '$_id',
          values: 1,
        } },
        { $sort: { month: 1 } },
      ])
      return rows.map(row => {
        const values = Object.fromEntries(row.values.map(value => [value.type, value.totalPaise]))
        return {
          month: row.month,
          incomePaise: values.income || 0,
          expensePaise: values.expense || 0,
          balancePaise: (values.income || 0) - (values.expense || 0),
        }
      })
    },
  }
}
