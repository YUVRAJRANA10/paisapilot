import { Router } from 'express'
import mongoose from 'mongoose'
import { AppError } from '../middleware/errors.js'

export function createHealthRouter({ serviceName = 'paisapilot-api', version = '0.1.0' } = {}) {
  const router = Router()

  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: serviceName,
      version,
    })
  })

  router.get('/ready', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      return next(new AppError(503, 'DATABASE_UNAVAILABLE', 'Required database is not ready.'))
    }

    return res.json({
      status: 'ready',
      service: serviceName,
      version,
    })
  })

  return router
}
