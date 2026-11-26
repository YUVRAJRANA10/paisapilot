import mongoose from 'mongoose'
import argon2 from 'argon2'
import { config } from '../config/index.js'
import { User } from '../models/User.js'
import { Category } from '../models/Category.js'
import { Transaction } from '../models/Transaction.js'
import { Budget } from '../models/Budget.js'

const SEED_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { name: 'Transport', icon: 'car', color: '#3b82f6' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#8b5cf6' },
  { name: 'Entertainment', icon: 'film', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: 'file-text', color: '#f59e0b' },
  { name: 'Healthcare', icon: 'heart-pulse', color: '#14b8a6' },
  { name: 'Salary', icon: 'briefcase', color: '#006948' },
]

async function seed() {
  console.log(`Connecting to MongoDB at ${config.MONGODB_URI}...`)
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  console.log(`Connected to database: ${mongoose.connection.name}`)

  const email = 'shreya@paisapilot.com'
  let user = await User.findOne({ email })
  if (!user) {
    const passwordHash = await argon2.hash('Password123!', { type: argon2.argon2id }).catch(() => 'hashed_password')
    user = await User.create({
      name: 'Shreya Sharma',
      email,
      passwordHash,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      monthlyIncomePaise: 8000000,
      onboardingCompleted: true,
    })
    console.log(`Created user: ${user.name} (${user.email})`)
  } else {
    console.log(`Found existing user: ${user.name}`)
  }

  // Ensure categories exist
  let categories = await Category.find({ userId: user._id })
  if (categories.length === 0) {
    categories = await Category.insertMany(
      SEED_CATEGORIES.map(c => ({
        userId: user._id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        isSystem: false,
        isArchived: false,
      }))
    )
    console.log(`Seeded ${categories.length} categories for user.`)
  } else {
    console.log(`User already has ${categories.length} categories.`)
  }

  // Ensure current month budgets exist
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const existingBudgets = await Budget.find({ userId: user._id, month: currentMonthStr })
  if (existingBudgets.length === 0) {
    const limits = {
      'Food & Dining': 1500000,
      'Transport': 800000,
      'Shopping': 1000000,
      'Bills & Utilities': 700000,
    }
    const seededBudgets = categories
      .filter(c => limits[c.name])
      .map(c => ({
        userId: user._id,
        categoryId: c._id,
        categoryName: c.name,
        categoryColor: c.color,
        month: currentMonthStr,
        limit: limits[c.name],
        limitPaise: limits[c.name],
      }))
    if (seededBudgets.length > 0) {
      await Budget.insertMany(seededBudgets)
      console.log(`Seeded ${seededBudgets.length} budgets for month ${currentMonthStr}.`)
    }
  }

  // Ensure at least one transaction exists
  const existingTxns = await Transaction.countDocuments({ userId: user._id })
  if (existingTxns === 0) {
    const foodCat = categories.find(c => c.name === 'Food & Dining') || categories[0]
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amount: 45000,
      amountPaise: 45000,
      categoryId: foodCat._id,
      categoryName: foodCat.name,
      categoryColor: foodCat.color,
      date: new Date().toISOString(),
      paymentMode: 'UPI',
      note: 'Initial Grocery & Snacks',
      status: 'cleared',
    })
    console.log(`Created initial transaction.`)
  }

  console.log(`Seed complete! Database "${mongoose.connection.name}" is now ready and populated.`)
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
