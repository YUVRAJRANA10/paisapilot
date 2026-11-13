import jwt from 'jsonwebtoken'
import { getCookieHeader } from '../utils/cookies.js'
import { AppError } from './errors.js'

export function createRequireAuth({ cookieName, jwtSecret, authService }) {
  return async function requireAuth(req, res, next) {
    try {
      const token = getCookieHeader(req.get('cookie'))[cookieName]
      if (!token) {
        return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'))
      }

      const claims = jwt.verify(token, jwtSecret, {
        issuer: 'paisapilot-api',
        audience: 'paisapilot-web',
      })
      const user = await authService.getUserById(claims.sub)
      if (!user) {
        return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'))
      }

      req.user = user
      return next()
    } catch (error) {
      if (error instanceof AppError) return next(error)
      return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'))
    }
  }
}
