import mongoose from 'mongoose'
import { config } from '../config/index.js'
import { User } from '../models/User.js'
import { Category } from '../models/Category.js'
import { Transaction } from '../models/Transaction.js'
import { Budget } from '../models/Budget.js'
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories.js'

async function seed() {
  console.log(`Connecting to MongoDB at ${config.MONGODB_URI}...`)
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  console.log(`Connected to database: ${mongoose.connection.name}`)

  // Find or create default user
  let user = await User.findOne({ email: 'shreya@paisapilot.com' })
  if (!user) {
    user = await User.create({
      email: 'shreya@paisapilot.com',
      name: 'Shreya Sharma',
      full_name: 'Shreya Sharma',
      username: 'shreyasharma',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    })
    console.log(`Created user: ${user.name} (${user.email})`)
  } else {
    console.log(`Found existing user: ${user.name}`)
  }

  // Ensure default categories exist
  let categories = await Category.find({ userId: user.id })
  if (categories.length === 0) {
    categories = await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({
      userId: user.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      budgetLimit: c.budgetLimit,
    })))
    console.log(`Seeded ${categories.length} categories for user.`)
  } else {
    console.log(`User already has ${categories.length} categories.`)
  }

  // Ensure initial month budgets exist
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const existingBudgets = await Budget.find({ userId: user.id, month: currentMonthStr })
  if (existingBudgets.length === 0) {
    const seededBudgets = categories.slice(0, 6).map(cat => ({
      userId: user.id,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      limit: cat.name === 'Food & Dining' ? 1500000 : cat.name === 'Transport' ? 800000 : 500000,
      month: currentMonthStr,
    }))
    await Budget.insertMany(seededBudgets)
    console.log(`Seeded ${seededBudgets.length} budgets for month ${currentMonthStr}.`)
  }

  // Ensure at least one transaction exists
  const existingTxns = await Transaction.countDocuments({ userId: user.id })
  if (existingTxns === 0) {
    const foodCat = categories.find(c => c.name === 'Food & Dining') || categories[0]
    await Transaction.create({
      userId: user.id,
      type: 'expense',
      amount: 45000, // ₹450
      categoryId: foodCat.id,
      categoryName: foodCat.name,
      categoryColor: foodCat.color,
      date: new Date().toISOString(),
      paymentMode: 'UPI',
      note: 'Initial Grocery & Snacks',
      status: 'cleared',
    })
    console.log(`Created initial transaction.`)
  }

  console.log(`Seed complete! Database "${mongoose.connection.name}" is now ready and active in MongoDB.`)
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
