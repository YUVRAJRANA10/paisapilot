import { z } from 'zod'

export const preferencesSchema = z.object({
  currency: z.string().trim().length(3).regex(/^[A-Za-z]{3}$/).optional(),
  timezone: z.string().trim().min(1).optional(),
  monthlyIncomePaise: z.number().int().nonnegative().safe().optional(),
  onboardingCompleted: z.boolean().optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'At least one preference is required.')
