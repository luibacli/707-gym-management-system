import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

// Gym members (BR-M1). Archived, never deleted (BR-M2).
const memberSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    birthDate: { type: String }, // "YYYY-MM-DD" (ADR-006)
    address: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    notes: { type: String, trim: true },
    archived: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
)

export const MEMBER_COLLATION = { locale: 'en', strength: 2 } as const

// Serves the member list: filter by archived, sort by name (case-insensitive), _id as tie-breaker.
memberSchema.index({ archived: 1, lastName: 1, firstName: 1, _id: 1 }, { collation: MEMBER_COLLATION })

export type MemberFields = InferSchemaType<typeof memberSchema>
type MemberModel = Model<MemberFields>

// Reuse the compiled model if it already exists (dev hot reload).
export const MemberModel: MemberModel
  = (mongoose.models.Member as MemberModel | undefined) ?? mongoose.model<MemberFields>('Member', memberSchema)
