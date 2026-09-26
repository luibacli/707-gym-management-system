/**
 * Demo data (docs/demo/demo-script.md). Resets the demo database and fills it with
 * realistic members and memberships, with dates relative to today.
 *
 *   pnpm demo:reset
 *
 * Only runs against a database whose name ends in "_demo" (DEMO_MONGODB_URI),
 * so it can never touch development or production data.
 */
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import mongoose from 'mongoose'
import { LoginAttemptModel } from '../server/models/LoginAttempt.ts'
import { MemberModel } from '../server/models/Member.ts'
import { MembershipModel } from '../server/models/Membership.ts'
import { User } from '../server/models/User.ts'
import { staffPasswordSchema } from '../shared/schemas/auth.ts'
import { todayInGymTimeZone } from '../shared/utils/date.ts'
import { addDays, calculateExpiryDate, type MembershipPlan } from '../shared/utils/membership.ts'

// Deterministic randomness: the same demo data on every reset.
let seed = 707
function random() {
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]!
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))

const FIRST_NAMES = [
  'Juan', 'Maria', 'Jose', 'Ana', 'Mark', 'Kristine', 'John Paul', 'Angelica', 'Carlo', 'Patricia',
  'Miguel', 'Camille', 'Paolo', 'Bea', 'Rafael', 'Nicole', 'Joshua', 'Andrea', 'Christian', 'Jasmine',
  'Adrian', 'Katrina', 'Gabriel', 'Denise', 'Ramon', 'Liza', 'Vincent', 'Joanna', 'Kevin', 'Grace',
]
const LAST_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Castillo', 'Flores',
  'Villanueva', 'Ramos', 'Castro', 'Rivera', 'Aquino', 'Navarro', 'Salazar', 'Mercado', 'Dela Cruz',
  'Gonzales', 'Lopez', 'Fernandez', 'Del Rosario', 'Pascual', 'Soriano', 'Domingo', 'Manalo', 'Tolentino',
]
const PREFIXES = ['0917', '0918', '0919', '0927', '0928', '0939', '0945', '0955', '0961', '0977', '0995']
const NOTES = ['Knee injury — avoid heavy squats', 'Student', 'Prefers morning sessions', 'Personal training on weekends']

type Scenario
  = | { kind: 'active', plan: MembershipPlan, daysLeft: number, history: number }
    | { kind: 'expiring', daysLeft: number, renewedAhead: boolean }
    | { kind: 'expired', daysAgo: number, renewedAhead?: boolean }
    | { kind: 'new' }
    | { kind: 'archived', daysAgo: number }

// 60 members with a realistic spread of statuses.
function scenarios(): Scenario[] {
  const list: Scenario[] = []
  for (let i = 0; i < 30; i++) {
    const plan: MembershipPlan = i % 5 === 0 ? 'annual' : 'monthly'
    list.push({ kind: 'active', plan, daysLeft: plan === 'annual' ? between(40, 330) : between(9, 27), history: between(0, 4) })
  }
  for (const daysLeft of [0, 1, 2, 3, 5, 7]) list.push({ kind: 'expiring', daysLeft, renewedAhead: false })
  for (const daysLeft of [2, 4]) list.push({ kind: 'expiring', daysLeft, renewedAhead: true })
  for (const daysAgo of [1, 3, 6, 12, 25]) list.push({ kind: 'expired', daysAgo })
  for (const daysAgo of [60, 95, 140, 200, 260, 330, 400]) list.push({ kind: 'expired', daysAgo })
  list.push({ kind: 'expired', daysAgo: 20, renewedAhead: true })
  for (let i = 0; i < 6; i++) list.push({ kind: 'new' })
  for (const daysAgo of [120, 250, 380]) list.push({ kind: 'archived', daysAgo })
  return list
}

/** A start date whose calculated expiry is exactly `expiryDate` (or the closest earlier one). */
function startForExpiry(expiryDate: string, plan: MembershipPlan): string {
  const [min, max] = plan === 'monthly' ? [27, 32] : [364, 367]
  for (let days = min; days <= max; days++) {
    const start = addDays(expiryDate, -days)
    if (calculateExpiryDate(start, plan) === expiryDate) return start
  }
  return addDays(expiryDate, plan === 'monthly' ? -30 : -365)
}

interface Period { plan: MembershipPlan, startDate: string, expiryDate: string }

/** A current period ending on `expiryDate`, plus `history` back-to-back earlier periods. */
function periodsEndingOn(expiryDate: string, plan: MembershipPlan, history: number): Period[] {
  const periods: Period[] = []
  let end = expiryDate
  for (let i = 0; i <= history; i++) {
    const startDate = startForExpiry(end, plan)
    periods.unshift({ plan, startDate, expiryDate: calculateExpiryDate(startDate, plan) })
    end = addDays(startDate, -1)
  }
  return periods
}

function nextPeriod(after: Period): Period {
  const startDate = addDays(after.expiryDate, 1)
  return { plan: after.plan, startDate, expiryDate: calculateExpiryDate(startDate, after.plan) }
}

function periodsFor(scenario: Scenario, today: string): Period[] {
  switch (scenario.kind) {
    case 'active':
      return periodsEndingOn(addDays(today, scenario.daysLeft), scenario.plan, scenario.history)
    case 'expiring': {
      const periods = periodsEndingOn(addDays(today, scenario.daysLeft), 'monthly', between(1, 5))
      return scenario.renewedAhead ? [...periods, nextPeriod(periods.at(-1)!)] : periods
    }
    case 'expired': {
      const periods = periodsEndingOn(addDays(today, -scenario.daysAgo), 'monthly', between(0, 3))
      if (!scenario.renewedAhead) return periods
      const startDate = addDays(today, 3)
      return [...periods, { plan: 'monthly', startDate, expiryDate: calculateExpiryDate(startDate, 'monthly') }]
    }
    case 'archived':
      return periodsEndingOn(addDays(today, -scenario.daysAgo), 'monthly', between(0, 2))
    case 'new':
      return []
  }
}

/** A timestamp at 9:00 AM Manila time on a calendar date. */
const at9am = (date: string) => new Date(`${date}T09:00:00+08:00`)

function phone() {
  return `${pick(PREFIXES)} ${between(100, 999)} ${between(1000, 9999)}`
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. See docs/development.md (Demo).`)
  return value
}

async function main() {
  const uri = requireEnv('DEMO_MONGODB_URI')
  const staffEmail = requireEnv('DEMO_STAFF_EMAIL').toLowerCase()
  const staffPassword = requireEnv('DEMO_STAFF_PASSWORD')
  const passwordCheck = staffPasswordSchema.safeParse(staffPassword)
  if (!passwordCheck.success) throw new Error(`DEMO_STAFF_PASSWORD: ${passwordCheck.error.issues[0]?.message}`)

  await mongoose.connect(uri)
  try {
    const dbName = mongoose.connection.db!.databaseName
    if (!dbName.endsWith('_demo')) {
      throw new Error(`Refusing to reset "${dbName}": the demo database name must end in "_demo".`)
    }

    const today = todayInGymTimeZone()
    await Promise.all([
      MemberModel.deleteMany({}), MembershipModel.deleteMany({}), User.deleteMany({}), LoginAttemptModel.deleteMany({}),
    ])
    await Promise.all([MemberModel.syncIndexes(), MembershipModel.syncIndexes(), User.syncIndexes(), LoginAttemptModel.syncIndexes()])

    const usedNames = new Set<string>()
    const members: Record<string, unknown>[] = []
    const memberships: Record<string, unknown>[] = []

    for (const scenario of scenarios()) {
      let firstName: string, lastName: string
      do {
        firstName = pick(FIRST_NAMES)
        lastName = pick(LAST_NAMES)
      } while (usedNames.has(`${firstName} ${lastName}`))
      usedNames.add(`${firstName} ${lastName}`)

      const periods = periodsFor(scenario, today)
      const joined = periods[0]?.startDate ?? addDays(today, -between(0, 10))
      const _id = new mongoose.Types.ObjectId()
      const emailName = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, '')

      members.push({
        _id,
        firstName,
        lastName,
        phone: phone(),
        ...(random() < 0.6 ? { email: `${emailName}@example.com` } : {}),
        ...(random() < 0.7 ? { birthDate: `${between(1975, 2006)}-${String(between(1, 12)).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}` } : {}),
        ...(random() < 0.4 ? { emergencyContactName: `${pick(FIRST_NAMES)} ${lastName}`, emergencyContactPhone: phone() } : {}),
        ...(random() < 0.12 ? { notes: pick(NOTES) } : {}),
        archived: scenario.kind === 'archived',
        createdAt: at9am(joined),
        updatedAt: at9am(periods.at(-1)?.startDate && periods.at(-1)!.startDate <= today ? periods.at(-1)!.startDate : joined),
      })
      for (const period of periods) {
        const created = at9am(period.startDate <= today ? period.startDate : today)
        memberships.push({ memberId: _id, ...period, createdAt: created, updatedAt: created })
      }
    }

    await MemberModel.collection.insertMany(members)
    await MembershipModel.collection.insertMany(memberships)

    const passwordHash = await new Hash(new Scrypt({})).make(staffPassword)
    await User.create({ name: 'Front Desk', email: staffEmail, passwordHash })

    console.info(`Demo database "${dbName}" reset for ${today}: ${members.length} members, ${memberships.length} memberships.`)
    console.info(`Sign in as ${staffEmail} (password: DEMO_STAFF_PASSWORD in .env).`)
  }
  finally {
    await mongoose.disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
