import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'
// Explicit .ts: models are also loaded by CLI scripts under plain Node (scripts/).
import { MEMBERSHIP_PLANS } from '../../shared/utils/membership.ts'

// A member's membership periods (BR-H1). Dates are "YYYY-MM-DD" (ADR-006).
const membershipSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    plan: { type: String, enum: MEMBERSHIP_PLANS, required: true },
    startDate: { type: String, required: true },
    // Always calculated on the server from startDate + plan (BR-P2).
    expiryDate: { type: String, required: true },
  },
  { timestamps: true },
)

// Serves a member's history (newest first), overlap checks, and status lookups for a page of members.
membershipSchema.index({ memberId: 1, startDate: -1 })

export type MembershipFields = InferSchemaType<typeof membershipSchema>
type MembershipModel = Model<MembershipFields>

// Reuse the compiled model if it already exists (dev hot reload).
export const MembershipModel: MembershipModel
  = (mongoose.models.Membership as MembershipModel | undefined)
    ?? mongoose.model<MembershipFields>('Membership', membershipSchema)
