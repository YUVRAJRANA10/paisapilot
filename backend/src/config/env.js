import { z } from 'zod'

const booleanFromEnv = z.preprocess(
  value => value === undefined ? undefined : value === 'true',
  z.boolean().default(false)
)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().trim().min(1, 'MONGODB_URI is required'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  APP_TIMEZONE: z.string().trim().min(1).default('Asia/Kolkata'),
  COOKIE_NAME: z.string().trim().min(1).default('paisapilot_session'),
  COOKIE_DOMAIN: z.string().trim().optional(),
  COOKIE_SECURE: booleanFromEnv,
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET must be at least 32 characters'),
  CRON_SECRET: z.string().trim().min(16, 'CRON_SECRET must be at least 16 characters'),
})

export function loadConfig(source = process.env) {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid backend configuration: ${details}`)
  }

  if (result.data.NODE_ENV === 'production' && !result.data.COOKIE_SECURE) {
    throw new Error('Invalid backend configuration: COOKIE_SECURE must be true in production')
  }

  return result.data
}
