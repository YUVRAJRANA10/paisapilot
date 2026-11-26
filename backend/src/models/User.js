import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, trim: true },
  full_name: { type: String, trim: true },
  username: { type: String, trim: true },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  passwordHash: { type: String },
}, { timestamps: true })

userSchema.virtual('id').get(function() {
  return this._id.toHexString()
})
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

export const User = mongoose.model('User', userSchema)
