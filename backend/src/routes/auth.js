import { Router } from 'express'
import { createRequireAuth } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { sessionCookieOptions } from '../utils/cookies.js'
import { loginSchema, registerSchema } from '../validators/auth.js'

function validate(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    const fields = {}
    result.error.issues.forEach(issue => {
      fields[issue.path.join('.') || 'request'] = issue.message
    })
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', fields)
  }
  return result.data
}

export function createAuthRouter({ authService, config }) {
  const router = Router()
  const cookieOptions = sessionCookieOptions(config)
  const requireAuth = createRequireAuth({
    cookieName: config.COOKIE_NAME,
    jwtSecret: config.JWT_SECRET,
    authService,
  })

  router.post('/register', async (req, res, next) => {
    try {
      const result = await authService.register(validate(registerSchema, req.body))
      res.cookie(config.COOKIE_NAME, result.token, cookieOptions)
      return res.status(201).json({ user: result.user })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/login', async (req, res, next) => {
    try {
      const result = await authService.login(validate(loginSchema, req.body))
      res.cookie(config.COOKIE_NAME, result.token, cookieOptions)
      return res.json({ user: result.user })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/logout', requireAuth, (req, res) => {
    res.clearCookie(config.COOKIE_NAME, { ...cookieOptions, maxAge: undefined })
    return res.status(204).send()
  })

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user })
  })

  return router
}
