import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true }, // in paise
  categoryId: { type: String, required: true },
  categoryName: { type: String, default: 'Unknown' },
  categoryColor: { type: String, default: '#9ca3af' },
  date: { type: String, required: true },
  paymentMode: { type: String, default: 'UPI' },
  paymentAccount: { type: String },
  note: { type: String, default: '' },
  status: { type: String, default: 'cleared' },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true })

transactionSchema.virtual('id').get(function() {
  return this._id.toHexString()
})
transactionSchema.set('toJSON', { virtuals: true })
transactionSchema.set('toObject', { virtuals: true })

export const Transaction = mongoose.model('Transaction', transactionSchema)
