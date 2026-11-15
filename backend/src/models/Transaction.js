import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amountPaise: {
    type: Number,
    required: true,
    min: 1,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
    required: true,
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
})

transactionSchema.index({ userId: 1, date: -1 })

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
