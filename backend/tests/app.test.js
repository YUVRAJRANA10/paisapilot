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
})

afterAll(async () => {
  vi.restoreAllMocks()
  await mongoose.disconnect()
})
