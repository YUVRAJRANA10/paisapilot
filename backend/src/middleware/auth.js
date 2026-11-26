import { verifyToken } from '../utils/token.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const authHeader = req.headers.authorization
    let token = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    } else if (req.headers['x-user-id']) {
      token = req.headers['x-user-id']
    }

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
      })
    }

    let user = null
    if (payload.id) {
      user = await User.findById(payload.id).catch(() => null)
      if (!user) {
        user = await User.findOne({ email: payload.email }).catch(() => null)
      }
    }

    if (!user) {
      // Fallback for user representation
      user = {
        _id: payload.id || 'default-user',
        id: payload.id || 'default-user',
        email: payload.email || 'user@example.com',
        name: payload.name || 'User',
      }
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
