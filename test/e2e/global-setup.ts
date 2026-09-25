import mongoose from 'mongoose'

// Clears login rate-limit records in the e2e database so repeated runs
// (many deliberate failed sign-ins from one IP) don't lock the tests out.
export default async function globalSetup() {
  const uri = process.env.E2E_MONGODB_URI
  if (!uri) return
  const connection = await mongoose.createConnection(uri).asPromise()
  try {
    await connection.db!.collection('loginattempts').deleteMany({})
  }
  finally {
    await connection.close()
  }
}
