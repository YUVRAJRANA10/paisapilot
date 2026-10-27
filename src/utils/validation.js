import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().length(3, 'Currency must be 3 letters'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  note: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive().default(1),
    endDate: z.string().optional(),
    occurrences: z.number().int().positive().optional(),
  }).optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  budgetLimit: z.number().int().nonnegative().optional(),
})

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
  limit: z.number().int().positive('Budget limit must be positive'),
})

export const validateForm = (schema, data) => {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    return { valid: false, errors, data: result.data }
  }
  return { valid: true, errors: {}, data: result.data }
}