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
  createdAt: string
  updatedAt: string
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
