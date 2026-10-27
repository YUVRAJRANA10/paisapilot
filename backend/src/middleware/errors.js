export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} was not found.`,
      requestId: req.requestId,
    },
  })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const isJsonSyntaxError = error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed'
  const status = isJsonSyntaxError ? 400 : error.status || 500
  const code = isJsonSyntaxError ? 'INVALID_JSON' : error.code || 'INTERNAL_SERVER_ERROR'
  const message = isJsonSyntaxError
    ? 'Request body contains malformed JSON.'
    : status >= 500 ? 'An unexpected server error occurred.' : error.message

  if (status >= 500) {
    console.error(`[http] ${req.requestId || 'unknown'} ${error.stack || error.message}`)
  }

  const response = {
    error: {
      code,
      message,
      requestId: req.requestId,
    },
  }
  if (error.fields && status < 500) response.error.fields = error.fields
  return res.status(status).json(response)
}
