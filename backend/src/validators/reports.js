import { z } from 'zod'

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must use YYYY-MM format.')
const year = z.string().regex(/^\d{4}$/, 'Must use YYYY format.')
const isoDate = z.string().datetime({ offset: true })

export const summaryQuerySchema = z.object({ month }).strict()
export const trendQuerySchema = z.object({ year }).strict()
export const categoryReportQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
}).strict().refine(value => value.from <= value.to, {
  message: 'from must be earlier than or equal to to.',
  path: ['from'],
})
export const exportReportQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  format: z.literal('csv').default('csv'),
}).strict().refine(value => value.from <= value.to, {
  message: 'from must be earlier than or equal to to.',
  path: ['from'],
})
