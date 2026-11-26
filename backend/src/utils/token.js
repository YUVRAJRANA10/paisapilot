import crypto from 'crypto'
import { config } from '../config/index.js'

export function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  })).toString('base64url')
  const secret = config.JWT_SECRET || 'paisapilot-jwt-secret-min-32-chars-long'
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) {
    // If token is a simple demo token or user id, return a fallback object
    return { id: token }
  }
  const [header, body, signature] = parts
  const secret = config.JWT_SECRET || 'paisapilot-jwt-secret-min-32-chars-long'
  const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  if (signature !== expectedSig) {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch (e) {
    return null
  }
}
