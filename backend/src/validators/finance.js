import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid resource ID.')
const isoDate = z.string().datetime({ offset: true })

const recurrence = z.object({
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  interval: z.number().int().positive().max(12).default(1),
  endDate: isoDate.optional(),
}).strict()

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  icon: z.string().trim().max(50).optional().default(''),
  color: z.string().trim().max(20).optional().default(''),
}).strict()

export const categoryUpdateSchema = categoryCreateSchema.partial().strict().refine(
  value => Object.keys(value).length > 0,
  'At least one field must be provided.',
)

const transactionFields = {
  type: z.enum(['income', 'expense']),
  amountPaise: z.number().int().positive().safe(),
  categoryId: objectId,
  date: isoDate,
  paymentMode: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'other']),
  note: z.string().trim().max(500).optional().default(''),
  isRecurring: z.boolean().optional().default(false),
  recurrence: recurrence.nullable().optional().default(null),
}

export const transactionCreateSchema = z.object(transactionFields).strict().superRefine((value, context) => {
  if (value.isRecurring && !value.recurrence) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['recurrence'], message: 'Recurrence is required for recurring transactions.' })
  }
})

export const transactionUpdateSchema = transactionCreateSchema

export const transactionQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: objectId.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).strict().refine(value => !value.from || !value.to || value.from <= value.to, {
  message: 'from must be earlier than or equal to to.',
  path: ['from'],
})
