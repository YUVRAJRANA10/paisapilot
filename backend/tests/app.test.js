import { afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config/env.js'
import jwt from 'jsonwebtoken'

const app = createApp({
  frontendOrigin: 'http://localhost:5173',
  serviceName: 'paisapilot-test-api',
  version: 'test',
  authConfig: {
    COOKIE_NAME: 'paisapilot_session',
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'lax',
    COOKIE_DOMAIN: '',
    JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  },
  authService: {
    async register(payload) {
      return {
        user: { id: 'user-1', ...payload, password: undefined },
        token: jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', { issuer: 'paisapilot-api', audience: 'paisapilot-web' }),
      }
    },
    async login() {
      return {
        user: { id: 'user-1', name: 'Yuvraj', email: 'yuvraj@example.com' },
        token: jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', { issuer: 'paisapilot-api', audience: 'paisapilot-web' }),
      }
    },
    async getUserById(id) {
      return id === 'user-1' ? { id, name: 'Yuvraj', email: 'yuvraj@example.com' } : null
    },
    async updatePreferences(id, payload) {
      return { id, name: 'Yuvraj', email: 'yuvraj@example.com', ...payload }
    },
  },
})

const financeCalls = []
const financeApp = createApp({
  frontendOrigin: 'http://localhost:5173',
  serviceName: 'paisapilot-test-api',
  version: 'test',
  authConfig: {
    COOKIE_NAME: 'paisapilot_session',
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'lax',
    COOKIE_DOMAIN: '',
    JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
  },
  authService: {
    async getUserById(id) {
      return id === 'user-1' ? { id, name: 'Yuvraj', email: 'yuvraj@example.com' } : null
    },
    async updatePreferences(id, payload) {
      return { id, name: 'Yuvraj', email: 'yuvraj@example.com', ...payload }
    },
  },
  categoryService: {
    async list(userId) {
      financeCalls.push(['category-list', userId])
      return []
    },
    async create(userId, payload) {
      financeCalls.push(['category-create', userId, payload])
      return { id: 'category-1', ...payload, isSystem: false, isArchived: false }
    },
    async update(userId, id, payload) {
      financeCalls.push(['category-update', userId, id, payload])
      return { id, ...payload, isSystem: false, isArchived: false }
    },
    async archive(userId, id) {
      financeCalls.push(['category-archive', userId, id])
    },
  },
  transactionService: {
    async list(userId, query) {
      financeCalls.push(['transaction-list', userId, query])
      return { data: [], pagination: { page: query.page, limit: query.limit, total: 0, totalPages: 0 } }
    },
    async create(userId, payload) {
      financeCalls.push(['transaction-create', userId, payload])
      return { id: 'transaction-1', ...payload }
    },
    async update(userId, id, payload) {
      financeCalls.push(['transaction-update', userId, id, payload])
      return { id, ...payload }
    },
    async remove(userId, id) {
      financeCalls.push(['transaction-remove', userId, id])
    },
  },
  reportService: {
    async exportCsv(userId, from, to) {
      financeCalls.push(['report-export', userId, from, to])
      return 'Date,Type,Category,Amount (paise),Payment mode,Note\r\n'
    },
    async summary(userId, month, timezone) {
      financeCalls.push(['report-summary', userId, month, timezone])
      return { incomePaise: 1000, expensePaise: 250, balancePaise: 750, savingsRate: 75, transactionCount: 2 }
    },
    async byCategory(userId, from, to) {
      financeCalls.push(['report-category', userId, from, to])
      return []
    },
    async monthlyTrend(userId, year, timezone) {
      financeCalls.push(['report-trend', userId, year, timezone])
      return []
    },
  },
  budgetService: {
    async list(userId, month, timezone) {
      financeCalls.push(['budget-list', userId, month, timezone])
      return []
    },
    async upsert(userId, categoryId, payload, timezone) {
      financeCalls.push(['budget-upsert', userId, categoryId, payload, timezone])
      return {
        id: 'budget-1',
        categoryId,
        categoryName: 'Food',
        ...payload,
        usedPaise: 2500,
        remainingPaise: payload.limitPaise - 2500,
        utilizationPercent: payload.limitPaise > 0 ? 25 : 0,
      }
    },
  },
})

describe('backend foundation', () => {
  it('returns a liveness response without requiring MongoDB', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'paisapilot-test-api',
      version: 'test',
    })
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('returns unavailable readiness when MongoDB is not connected', async () => {
    const response = await request(app).get('/api/ready')

    expect(response.status).toBe(503)
    expect(response.body.error.code).toBe('DATABASE_UNAVAILABLE')
    expect(response.body.error.requestId).toBeTruthy()
  })

  it('returns the documented not-found error shape', async () => {
    const response = await request(app).get('/api/not-a-route')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
    expect(response.body.error.requestId).toBeTruthy()
  })

  it('returns a stable malformed JSON error', async () => {
    const response = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":')

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({
      code: 'INVALID_JSON',
      message: 'Request body contains malformed JSON.',
    })
  })

  it('rejects a disallowed CORS origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://untrusted.example')

    expect(response.status).toBe(200)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('validates required and secure configuration', () => {
    expect(() => loadConfig({
      NODE_ENV: 'test',
      PORT: '5000',
      MONGODB_URI: 'mongodb://localhost/paisapilot',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'a'.repeat(32),
      CRON_SECRET: 'b'.repeat(16),
    })).not.toThrow()

    expect(() => loadConfig({
      NODE_ENV: 'production',
      PORT: '5000',
      MONGODB_URI: 'mongodb://localhost/paisapilot',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'short',
      CRON_SECRET: 'short',
    })).toThrow(/JWT_SECRET/)
  })

  it('validates registration and sets an HttpOnly session cookie', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Yuvraj',
        email: 'yuvraj@example.com',
        password: 'password123',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      })

    expect(response.status).toBe(201)
    expect(response.body.user.password).toBeUndefined()
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
  })

  it('rejects invalid authentication input', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('requires authentication for the current-user endpoint', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('persists onboarding completion through preferences', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })

    const response = await request(app)
      .patch('/api/user/preferences')
      .set('Cookie', `paisapilot_session=${token}`)
      .send({ onboardingCompleted: true })

    expect(response.status).toBe(200)
    expect(response.body.preferences.onboardingCompleted).toBe(true)
  })
})

describe('categories and transactions routes', () => {
  it('requires authentication for finance resources', async () => {
    const response = await request(financeApp).get('/api/categories')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('validates transaction amounts before calling the service', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })

    const response = await request(financeApp)
      .post('/api/transactions')
      .set('Cookie', `paisapilot_session=${token}`)
      .send({
        type: 'expense',
        amountPaise: 0,
        categoryId: '507f1f77bcf86cd799439011',
        date: '2026-11-15T10:00:00.000Z',
        paymentMode: 'upi',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(financeCalls.some(call => call[0] === 'transaction-create')).toBe(false)
  })

  it('passes the authenticated user to category and transaction services', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })

    const categoryResponse = await request(financeApp)
      .post('/api/categories')
      .set('Cookie', `paisapilot_session=${token}`)
      .send({ name: 'Food', icon: 'utensils', color: '#123456' })

    const transactionResponse = await request(financeApp)
      .get('/api/transactions?page=2&limit=10&type=expense')
      .set('Cookie', `paisapilot_session=${token}`)

    expect(categoryResponse.status).toBe(201)
    expect(transactionResponse.status).toBe(200)
    expect(financeCalls).toContainEqual(['category-create', 'user-1', {
      name: 'Food',
      icon: 'utensils',
      color: '#123456',
    }])
    expect(financeCalls).toContainEqual(['transaction-list', 'user-1', {
      page: 2,
      limit: 10,
      type: 'expense',
    }])
  })

  it('protects reports and validates report query parameters', async () => {
    const unauthenticated = await request(financeApp).get('/api/reports/summary?month=2026-11')
    expect(unauthenticated.status).toBe(401)

    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const invalid = await request(financeApp)
      .get('/api/reports/summary?month=November')
      .set('Cookie', `paisapilot_session=${token}`)

    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('passes authenticated report requests to the report service', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const response = await request(financeApp)
      .get('/api/reports/summary?month=2026-11')
      .set('Cookie', `paisapilot_session=${token}`)

    expect(response.status).toBe(200)
    expect(response.body.summary).toEqual({
      incomePaise: 1000,
      expensePaise: 250,
      balancePaise: 750,
      savingsRate: 75,
      transactionCount: 2,
    })
    expect(financeCalls).toContainEqual(['report-summary', 'user-1', '2026-11', undefined])
  })

  it('exports an authenticated CSV report', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const response = await request(financeApp)
      .get('/api/reports/export?from=2026-11-01T00:00:00.000Z&to=2026-11-30T23:59:59.999Z&format=csv')
      .set('Cookie', `paisapilot_session=${token}`)

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('text/csv')
    expect(response.headers['content-disposition']).toContain('paisapilot-report.csv')
    expect(response.text).toContain('Amount (paise)')
    expect(financeCalls).toContainEqual([
      'report-export',
      'user-1',
      '2026-11-01T00:00:00.000Z',
      '2026-11-30T23:59:59.999Z',
    ])
  })

  it('requires authentication and valid parameters for CSV exports', async () => {
    const unauthenticated = await request(financeApp).get(
      '/api/reports/export?from=2026-11-01T00:00:00.000Z&to=2026-11-30T23:59:59.999Z&format=csv',
    )
    expect(unauthenticated.status).toBe(401)

    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const invalid = await request(financeApp)
      .get('/api/reports/export?from=2026-12-01T00:00:00.000Z&to=2026-11-30T23:59:59.999Z&format=csv')
      .set('Cookie', `paisapilot_session=${token}`)

    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('protects budgets and validates budget limits', async () => {
    const unauthenticated = await request(financeApp).get('/api/budgets?month=2026-11')
    expect(unauthenticated.status).toBe(401)

    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const invalid = await request(financeApp)
      .put('/api/budgets/507f1f77bcf86cd799439011')
      .set('Cookie', `paisapilot_session=${token}`)
      .send({ month: '2026-11', limitPaise: -1 })

    expect(invalid.status).toBe(400)
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('passes authenticated budget requests to the budget service', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret-that-is-at-least-32-characters', {
      issuer: 'paisapilot-api',
      audience: 'paisapilot-web',
    })
    const response = await request(financeApp)
      .put('/api/budgets/507f1f77bcf86cd799439011')
      .set('Cookie', `paisapilot_session=${token}`)
      .send({ month: '2026-11', limitPaise: 10000 })

    expect(response.status).toBe(200)
    expect(response.body.budget.remainingPaise).toBe(7500)
    expect(financeCalls).toContainEqual(['budget-upsert', 'user-1', '507f1f77bcf86cd799439011', {
      month: '2026-11',
      limitPaise: 10000,
    }, undefined])
  })
})

afterAll(async () => {
  vi.restoreAllMocks()
  await mongoose.disconnect()
})
