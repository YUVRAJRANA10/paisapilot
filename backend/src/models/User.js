import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    uppercase: true,
    minlength: 3,
    maxlength: 3,
  },
  monthlyIncomePaise: {
    type: Number,
    min: 0,
    default: 0,
  },
  timezone: {
    type: String,
    required: true,
    default: 'Asia/Kolkata',
  },
}, {
  timestamps: true,
  versionKey: false,
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
