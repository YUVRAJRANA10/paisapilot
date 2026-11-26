import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#006948' },
  icon: { type: String, default: 'tag' },
  budgetLimit: { type: Number, default: 0 },
}, { timestamps: true })

categorySchema.virtual('id').get(function() {
  return this._id.toHexString()
})
categorySchema.set('toJSON', { virtuals: true })
categorySchema.set('toObject', { virtuals: true })

export const Category = mongoose.model('Category', categorySchema)
