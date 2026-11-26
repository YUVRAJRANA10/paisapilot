import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'

const app = createApp({
  frontendOrigin: 'http://localhost:5173',
  serviceName: 'paisapilot-test-api',
  version: 'test',
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('health and readiness endpoints', () => {
  it('returns ok status on GET /api/health with request id header', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'paisapilot-test-api',
      version: 'test',
    })
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('returns 503 DATABASE_UNAVAILABLE on GET /api/ready when database is not connected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0)

    const response = await request(app).get('/api/ready')

    expect(response.status).toBe(503)
    expect(response.body.error.code).toBe('DATABASE_UNAVAILABLE')
    expect(response.body.error.message).toBeTruthy()
    expect(response.body.error.requestId).toBeTruthy()
  })

  it('returns 200 ready on GET /api/ready when mongoose connection readyState is 1', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1)

    const response = await request(app).get('/api/ready')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ready',
      service: 'paisapilot-test-api',
      version: 'test',
    })
  })
})