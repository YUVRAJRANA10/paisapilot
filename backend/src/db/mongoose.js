import mongoose from 'mongoose'

export async function connectToDatabase(uri) {
  if (!uri) {
    throw new Error('MongoDB connection string is required')
  }

  mongoose.connection.on('error', error => {
    console.error(`[mongodb] connection error: ${error.message}`)
  })

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })

  console.info(`[mongodb] connected to ${mongoose.connection.name || 'configured database'}`)
  return mongoose.connection
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    console.info('[mongodb] disconnected')
  }
}
