import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

// Staff accounts (ADR-001). Created and deactivated via scripts/staff.ts (BR-A2).
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    // Unique index: login looks users up by email.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

export type UserFields = InferSchemaType<typeof userSchema>
type UserModel = Model<UserFields>

// Reuse the compiled model if it already exists (dev hot reload).
export const User: UserModel
  = (mongoose.models.User as UserModel | undefined) ?? mongoose.model<UserFields>('User', userSchema)
