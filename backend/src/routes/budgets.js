import { Router } from 'express'
import { createRequireAuth } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { budgetCategorySchema, budgetQuerySchema, budgetUpdateSchema } from '../validators/budgets.js'

function validate(schema, input) {
  const result = schema.safeParse(input)
  if (!result.success) {
    const fields = {}
    result.error.issues.forEach(issue => {
      fields[issue.path.join('.') || 'request'] = issue.message
    })
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', fields)
  }
  return result.data
}

export function createBudgetsRouter({ budgetService, authConfig, authService }) {
  const router = Router()
  const requireAuth = createRequireAuth({
    cookieName: authConfig.COOKIE_NAME,
    jwtSecret: authConfig.JWT_SECRET,
    authService,
  })

  router.use(['/budgets', '/budgets/:categoryId'], requireAuth)

  router.get('/budgets', async (req, res, next) => {
    try {
      const { month } = validate(budgetQuerySchema, req.query)
      res.json({ budgets: await budgetService.list(req.user.id, month, req.user.timezone) })
    } catch (error) {
      next(error)
    }
  })

  router.put('/budgets/:categoryId', async (req, res, next) => {
    try {
      const categoryId = validate(budgetCategorySchema, req.params.categoryId)
      const payload = validate(budgetUpdateSchema, req.body)
      res.json({ budget: await budgetService.upsert(req.user.id, categoryId, payload, req.user.timezone) })
    } catch (error) {
      next(error)
    }
  })

  return router
}
