import { Router } from 'express'
import { createRequireAuth } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { preferencesSchema } from '../validators/preferences.js'

function validate(input) {
  const result = preferencesSchema.safeParse(input)
  if (!result.success) {
    const fields = {}
    result.error.issues.forEach(issue => { fields[issue.path.join('.') || 'request'] = issue.message })
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', fields)
  }
  return result.data
}

export function createPreferencesRouter({ authConfig, authService }) {
  const router = Router()
  const requireAuth = createRequireAuth({
    cookieName: authConfig.COOKIE_NAME,
    jwtSecret: authConfig.JWT_SECRET,
    authService,
  })
  router.use(['/user/preferences'], requireAuth)
  router.get('/user/preferences', (req, res) => res.json({ preferences: req.user }))
  router.patch('/user/preferences', async (req, res, next) => {
    try {
      const preferences = await authService.updatePreferences(req.user.id, validate(req.body))
      res.json({ preferences })
    } catch (error) {
      next(error)
    }
  })
  return router
}
