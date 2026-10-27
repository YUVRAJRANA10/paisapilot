import { config } from './config/index.js'
import { createApp } from './app.js'
import { connectToDatabase, disconnectFromDatabase } from './db/mongoose.js'

const app = createApp({
  frontendOrigin: config.FRONTEND_ORIGIN,
  version: '0.1.0',
})

let server

async function start() {
  await connectToDatabase(config.MONGODB_URI)
  server = app.listen(config.PORT, () => {
    console.info(`[server] PaisaPilot API listening on port ${config.PORT}`)
  })
}

async function shutdown(signal) {
  console.info(`[server] received ${signal}; shutting down`)
  if (server) {
    await new Promise(resolve => server.close(resolve))
  }
  await disconnectFromDatabase()
}

process.once('SIGINT', () => shutdown('SIGINT').then(() => process.exit(0)).catch(() => process.exit(1)))
process.once('SIGTERM', () => shutdown('SIGTERM').then(() => process.exit(0)).catch(() => process.exit(1)))

start().catch(error => {
  console.error(`[server] startup failed: ${error.message}`)
  process.exitCode = 1
})
