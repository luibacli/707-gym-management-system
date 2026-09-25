import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach } from 'vitest'

// Isolated in-memory MongoDB per test file (ADR-007). Never touches Atlas.
let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  await mongoose.connect(server.getUri())
  await mongoose.connection.syncIndexes()
})

beforeEach(async () => {
  const collections = await mongoose.connection.db!.collections()
  await Promise.all(collections.map(collection => collection.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  await server.stop()
})
