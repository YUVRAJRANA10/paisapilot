import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, default: 'Unknown' },
  categoryColor: { type: String, default: '#006948' },
  limit: { type: Number, required: true, default: 0 }, // in paise
  month: { type: String, required: true }, // YYYY-MM
}, { timestamps: true })

budgetSchema.virtual('id').get(function() {
  return this._id.toHexString()
})
budgetSchema.set('toJSON', { virtuals: true })
budgetSchema.set('toObject', { virtuals: true })

export const Budget = mongoose.model('Budget', budgetSchema)
