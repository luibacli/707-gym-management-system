import type { HydratedDocument } from 'mongoose'
import { MEMBER_COLLATION, MemberModel, type MemberFields } from '../models/Member'
import { MEMBER_PAGE_SIZE, type MemberInput, type MemberListQuery } from '../../shared/schemas/member'
import type { ListResponse, Member } from '../../shared/types/member'
import type { MemberStatus } from '../../shared/utils/membership'
import { getMemberStatuses } from './memberships'

const EDITABLE_FIELDS = [
  'firstName', 'lastName', 'phone', 'email', 'birthDate', 'address',
  'emergencyContactName', 'emergencyContactPhone', 'notes',
] as const satisfies readonly (keyof MemberInput)[]

const SEARCH_FIELDS = ['firstName', 'lastName', 'phone', 'email'] as const

function toMember(doc: HydratedDocument<MemberFields>, status: MemberStatus): Member {
  return {
    id: doc.id as string,
    firstName: doc.firstName,
    lastName: doc.lastName,
    phone: doc.phone,
    email: doc.email ?? undefined,
    birthDate: doc.birthDate ?? undefined,
    address: doc.address ?? undefined,
    emergencyContactName: doc.emergencyContactName ?? undefined,
    emergencyContactPhone: doc.emergencyContactPhone ?? undefined,
    notes: doc.notes ?? undefined,
    archived: doc.archived,
    status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Every search word must match at least one of name, phone or email (case-insensitive). */
function searchFilter(search: string) {
  const words = search.split(/\s+/).filter(Boolean)
  return {
    $and: words.map((word) => {
      const pattern = new RegExp(escapeRegex(word), 'i')
      return { $or: SEARCH_FIELDS.map(field => ({ [field]: pattern })) }
    }),
  }
}

export async function listMembers({ search, archived, page }: MemberListQuery): Promise<ListResponse<Member>> {
  const filter = { archived, ...(search ? searchFilter(search) : {}) }

  const [docs, total] = await Promise.all([
    MemberModel.find(filter)
      .sort({ lastName: 1, firstName: 1, _id: 1 })
      .collation(MEMBER_COLLATION)
      .skip((page - 1) * MEMBER_PAGE_SIZE)
      .limit(MEMBER_PAGE_SIZE),
    MemberModel.countDocuments(filter),
  ])

  const statuses = await getMemberStatuses(docs.map(doc => doc._id))
  return {
    items: docs.map(doc => toMember(doc, statuses.get(doc.id as string) ?? 'none')),
    total,
    page,
    pageSize: MEMBER_PAGE_SIZE,
  }
}

/** Maps a member document to the API shape, including its current status. */
async function withStatus(doc: HydratedDocument<MemberFields>): Promise<Member> {
  const statuses = await getMemberStatuses([doc._id])
  return toMember(doc, statuses.get(doc.id as string) ?? 'none')
}

export async function getMember(id: string): Promise<Member | null> {
  const doc = await MemberModel.findById(id)
  return doc ? withStatus(doc) : null
}

export async function createMember(input: MemberInput): Promise<Member> {
  const doc = await MemberModel.create(input)
  return toMember(doc, 'none')
}

/** Replaces all editable fields; optional fields left empty are cleared. */
export async function updateMember(id: string, input: MemberInput): Promise<Member | null> {
  const doc = await MemberModel.findById(id)
  if (!doc) return null

  for (const field of EDITABLE_FIELDS) {
    doc.set(field, input[field])
  }
  await doc.save()
  return withStatus(doc)
}

export async function setMemberArchived(id: string, archived: boolean): Promise<Member | null> {
  const doc = await MemberModel.findByIdAndUpdate(id, { archived }, { returnDocument: 'after' })
  return doc ? withStatus(doc) : null
}
