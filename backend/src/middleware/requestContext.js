import { randomUUID } from 'node:crypto'

export function requestContext(req, res, next) {
  const requestId = req.get('x-request-id') || randomUUID()
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  next()
}
