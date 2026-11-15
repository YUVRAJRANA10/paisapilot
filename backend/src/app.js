import express from 'express'
import cors from 'cors'
import { createHealthRouter } from './routes/health.js'
import { requestContext } from './middleware/requestContext.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errors.js'
import { createAuthRouter } from './routes/auth.js'
import { createAuthService } from './services/authService.js'
import { createCategoryService } from './services/categoryService.js'
import { createTransactionService } from './services/transactionService.js'
import { createFinanceRouter } from './routes/finance.js'
import { createReportService } from './services/reportService.js'
import { createReportsRouter } from './routes/reports.js'
import { createBudgetService } from './services/budgetService.js'
import { createBudgetsRouter } from './routes/budgets.js'
import { createPreferencesRouter } from './routes/preferences.js'

const defaultAuthConfig = {
  COOKIE_NAME: 'paisapilot_session',
  COOKIE_SECURE: false,
  COOKIE_SAME_SITE: 'lax',
  COOKIE_DOMAIN: '',
  JWT_SECRET: 'development-only-secret-that-must-never-be-used-in-production',
}

export function createApp({
  frontendOrigin = 'http://localhost:5173',
  serviceName = 'paisapilot-api',
  version = '0.1.0',
  authService = null,
  categoryService = null,
  transactionService = null,
  reportService = null,
  budgetService = null,
  authConfig = defaultAuthConfig,
} = {}) {
  const app = express()
  const resolvedAuthService = authService || createAuthService({ jwtSecret: authConfig.JWT_SECRET })

  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendOrigin) {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '100kb' }))
  app.use(requestLogger)
  app.use('/api', createHealthRouter({ serviceName, version }))
  app.use('/api/auth', createAuthRouter({
    authService: resolvedAuthService,
    config: authConfig,
  }))
  app.use('/api', createFinanceRouter({
    authService: resolvedAuthService,
    authConfig,
    categoryService: categoryService || createCategoryService(),
    transactionService: transactionService || createTransactionService(),
  }))
  app.use('/api', createReportsRouter({
    authService: resolvedAuthService,
    authConfig,
    reportService: reportService || createReportService(),
  }))
  app.use('/api', createBudgetsRouter({
    authService: resolvedAuthService,
    authConfig,
    budgetService: budgetService || createBudgetService(),
  }))
  app.use('/api', createPreferencesRouter({
    authService: resolvedAuthService,
    authConfig,
  }))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
