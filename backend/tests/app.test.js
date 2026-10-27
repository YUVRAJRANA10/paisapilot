import { afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config/env.js'

const app = createApp({
  frontendOrigin: 'http://localhost:5173',
  serviceName: 'paisapilot-test-api',
  version: 'test',
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
})

afterAll(async () => {
  vi.restoreAllMocks()
  await mongoose.disconnect()
})
