import { z } from 'zod'

const categoryId = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid category ID.')
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must use YYYY-MM format.')

export const budgetQuerySchema = z.object({ month }).strict()

export const budgetUpdateSchema = z.object({
  month,
  limitPaise: z.number().int().nonnegative().safe(),
}).strict()

export const budgetCategorySchema = categoryId
