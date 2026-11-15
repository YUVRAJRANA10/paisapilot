import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-(0[1-9]|1[0-2])$/,
  },
  limitPaise: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
  versionKey: false,
})

budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true })

export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema)
