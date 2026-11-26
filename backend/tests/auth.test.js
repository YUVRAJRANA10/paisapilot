import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js'

const TEST_JWT_SECRET = 'test-secret-that-is-at-least-32-characters'
const COOKIE_NAME = 'paisapilot_session'

function createToken(sub = 'user-1') {
  return jwt.sign({ sub }, TEST_JWT_SECRET, {
    issuer: 'paisapilot-api',
    audience: 'paisapilot-web',
  })
}

describe('auth validation and unauthenticated access', () => {
  let registerSpy
  let loginSpy
  let getUserByIdSpy
  let app

  beforeEach(() => {
    registerSpy = vi.fn(async (payload) => ({
      user: { id: 'user-1', name: payload.name, email: payload.email },
      token: createToken('user-1'),
    }))

    loginSpy = vi.fn(async () => ({
      user: { id: 'user-1', name: 'Yuvraj', email: 'yuvraj@example.com' },
      token: createToken('user-1'),
    }))

    getUserByIdSpy = vi.fn(async (id) =>
      id === 'user-1' ? { id, name: 'Yuvraj', email: 'yuvraj@example.com' } : null,
    )

    app = createApp({
      frontendOrigin: 'http://localhost:5173',
      serviceName: 'paisapilot-test-api',
      version: 'test',
      authConfig: {
        COOKIE_NAME,
        COOKIE_SECURE: false,
        COOKIE_SAME_SITE: 'lax',
        COOKIE_DOMAIN: '',
        JWT_SECRET: TEST_JWT_SECRET,
      },
      authService: {
        register: registerSpy,
        login: loginSpy,
        getUserById: getUserByIdSpy,
      },
    })
  })

  it('rejects invalid registration input with 400 VALIDATION_ERROR without calling register service', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: '',
        email: 'invalid-email',
        password: '123',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.fields).toBeDefined()
    expect(registerSpy).not.toHaveBeenCalled()
  })

  it('accepts valid registration input, sets HttpOnly cookie, and returns 201', async () => {
    const payload = {
      name: 'Devyash',
      email: 'devyash@example.com',
      password: 'password123',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(payload)

    expect(response.status).toBe(201)
    expect(response.body.user).toMatchObject({
      id: 'user-1',
      name: 'Devyash',
      email: 'devyash@example.com',
    })
    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.headers['set-cookie'][0]).toContain(`${COOKIE_NAME}=`)
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
    expect(registerSpy).toHaveBeenCalledOnce()
  })

  it('rejects invalid login input with 400 VALIDATION_ERROR without calling login service', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: '',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.fields).toBeDefined()
    expect(loginSpy).not.toHaveBeenCalled()
  })

  it('accepts valid login input, sets HttpOnly cookie, and returns 200', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'yuvraj@example.com',
        password: 'password123',
      })

    expect(response.status).toBe(200)
    expect(response.body.user).toEqual({
      id: 'user-1',
      name: 'Yuvraj',
      email: 'yuvraj@example.com',
    })
    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.headers['set-cookie'][0]).toContain(`${COOKIE_NAME}=`)
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
    expect(loginSpy).toHaveBeenCalledOnce()
  })

  it('returns 401 UNAUTHENTICATED on GET /api/auth/me when no cookie is sent', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 401 UNAUTHENTICATED on GET /api/auth/me when token is invalid', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${COOKIE_NAME}=invalid-token-value`)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 401 UNAUTHENTICATED on POST /api/auth/logout when unauthenticated', async () => {
    const response = await request(app).post('/api/auth/logout')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 401 UNAUTHENTICATED on PATCH /api/user/preferences when unauthenticated', async () => {
    const response = await request(app)
      .patch('/api/user/preferences')
      .send({ onboardingCompleted: true })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })
})