import { Router } from 'express'
import { createRequireAuth } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  transactionCreateSchema,
  transactionQuerySchema,
  transactionUpdateSchema,
} from '../validators/finance.js'

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

function resourceId(req) {
  return req.params.id
}

export function createFinanceRouter({ categoryService, transactionService, authConfig, authService }) {
  const router = Router()
  const requireAuth = createRequireAuth({
    cookieName: authConfig.COOKIE_NAME,
    jwtSecret: authConfig.JWT_SECRET,
    authService,
  })

  router.use(['/categories', '/transactions'], requireAuth)

  router.get('/categories', async (req, res, next) => {
    try {
      res.json({ data: await categoryService.list(req.user.id) })
    } catch (error) {
      next(error)
    }
  })

  router.post('/categories', async (req, res, next) => {
    try {
      res.status(201).json({ category: await categoryService.create(req.user.id, validate(categoryCreateSchema, req.body)) })
    } catch (error) {
      next(error)
    }
  })

  router.put('/categories/:id', async (req, res, next) => {
    try {
      res.json({ category: await categoryService.update(req.user.id, resourceId(req), validate(categoryUpdateSchema, req.body)) })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/categories/:id', async (req, res, next) => {
    try {
      await categoryService.archive(req.user.id, resourceId(req))
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  router.get('/transactions', async (req, res, next) => {
    try {
      res.json(await transactionService.list(req.user.id, validate(transactionQuerySchema, req.query)))
    } catch (error) {
      next(error)
    }
  })

  router.post('/transactions', async (req, res, next) => {
    try {
      res.status(201).json({ transaction: await transactionService.create(req.user.id, validate(transactionCreateSchema, req.body)) })
    } catch (error) {
      next(error)
    }
  })

  router.put('/transactions/:id', async (req, res, next) => {
    try {
      res.json({ transaction: await transactionService.update(req.user.id, resourceId(req), validate(transactionUpdateSchema, req.body)) })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/transactions/:id', async (req, res, next) => {
    try {
      await transactionService.remove(req.user.id, resourceId(req))
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  return router
}
