import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  icon: {
    type: String,
    trim: true,
    maxlength: 50,
    default: '',
  },
  color: {
    type: String,
    trim: true,
    maxlength: 20,
    default: '',
  },
  isSystem: {
    type: Boolean,
    default: false,
    index: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  versionKey: false,
})

categorySchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { isSystem: false } })

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)
