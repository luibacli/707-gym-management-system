import type { MemberStatus, MembershipPlan, MembershipStatus } from '../utils/membership'

/** A member as returned by the API. Calendar dates are "YYYY-MM-DD" (ADR-006). */
export interface Member {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  birthDate?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
  archived: boolean
  /** Current status on today's date in the gym timezone (BR-S3). */
  status: MemberStatus
  createdAt: string
  updatedAt: string
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface Membership {
  id: string
  memberId: string
  plan: MembershipPlan
  startDate: string
  expiryDate: string
  /** Status on today's date in the gym timezone (BR-S2). */
  status: MembershipStatus
  createdAt: string
  updatedAt: string
}
