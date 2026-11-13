import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  currency: z.string().trim().length(3).regex(/^[A-Za-z]{3}$/).default('INR'),
  timezone: z.string().trim().min(1).default('Asia/Kolkata'),
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
}).strict()
