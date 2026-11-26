import express from 'express'
import cors from 'cors'
import { createHealthRouter } from './routes/health.js'
import { createAuthRouter } from './routes/auth.js'
import { createCategoriesRouter } from './routes/categories.js'
import { createTransactionsRouter } from './routes/transactions.js'
import { createBudgetsRouter } from './routes/budgets.js'
import { createReportsRouter } from './routes/reports.js'
import { requestContext } from './middleware/requestContext.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errors.js'

export function createApp({
  frontendOrigin = 'http://localhost:5173',
  serviceName = 'paisapilot-api',
  version = '0.1.0',
} = {}) {
  const app = express()

  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendOrigin || origin === 'http://127.0.0.1:5173' || origin === 'http://localhost:5173') {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '100kb' }))
  app.use(requestLogger)
  app.use('/api', createHealthRouter({ serviceName, version }))
  app.use('/api/auth', createAuthRouter())
  app.use('/api/categories', createCategoriesRouter())
  app.use('/api/transactions', createTransactionsRouter())
  app.use('/api/budgets', createBudgetsRouter())
  app.use('/api/reports', createReportsRouter())
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
