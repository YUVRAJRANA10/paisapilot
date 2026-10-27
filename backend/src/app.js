import express from 'express'
import cors from 'cors'
import { createHealthRouter } from './routes/health.js'
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
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
