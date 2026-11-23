import { Router } from 'express'
import { createRequireAuth } from '../middleware/auth.js'
import { AppError } from '../middleware/errors.js'
import { categoryReportQuerySchema, exportReportQuerySchema, summaryQuerySchema, trendQuerySchema } from '../validators/reports.js'

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

export function createReportsRouter({ reportService, authConfig, authService }) {
  const router = Router()
  const requireAuth = createRequireAuth({
    cookieName: authConfig.COOKIE_NAME,
    jwtSecret: authConfig.JWT_SECRET,
    authService,
  })

  router.use(['/reports/summary', '/reports/by-category', '/reports/monthly-trend', '/reports/export'], requireAuth)

  router.get('/reports/export', async (req, res, next) => {
    try {
      const { from, to } = validate(exportReportQuerySchema, req.query)
      const csv = await reportService.exportCsv(req.user.id, from, to)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="paisapilot-report.csv"')
      res.send(csv)
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/summary', async (req, res, next) => {
    try {
      const { month } = validate(summaryQuerySchema, req.query)
      res.json({ summary: await reportService.summary(req.user.id, month, req.user.timezone) })
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/by-category', async (req, res, next) => {
    try {
      const { from, to } = validate(categoryReportQuerySchema, req.query)
      res.json({ categories: await reportService.byCategory(req.user.id, from, to) })
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/monthly-trend', async (req, res, next) => {
    try {
      const { year } = validate(trendQuerySchema, req.query)
      res.json({ months: await reportService.monthlyTrend(req.user.id, year, req.user.timezone) })
    } catch (error) {
      next(error)
    }
  })

  return router
}
