import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

export const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60

// Failed sign-in attempts, for rate limiting (ADR-001). MongoDB deletes them after the window.
const loginAttemptSchema = new Schema({
  // "email:<address>" or "ip:<address>"
  key: { type: String, required: true },
  createdAt: { type: Date, required: true, default: () => new Date() },
})

// Serves the count of recent failures per key.
loginAttemptSchema.index({ key: 1, createdAt: -1 })
// TTL: expired attempts are removed automatically (checked by MongoDB about once a minute).
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: LOGIN_ATTEMPT_WINDOW_SECONDS })

type LoginAttemptModel = Model<InferSchemaType<typeof loginAttemptSchema>>

// Reuse the compiled model if it already exists (dev hot reload).
export const LoginAttemptModel: LoginAttemptModel
  = (mongoose.models.LoginAttempt as LoginAttemptModel | undefined)
    ?? mongoose.model('LoginAttempt', loginAttemptSchema)
