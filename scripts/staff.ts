/**
 * Staff account management (BR-A2). There is no in-app staff management.
 *
 *   pnpm staff create --email <email> --name "<full name>"
 *   pnpm staff set-password --email <email>
 *   pnpm staff deactivate --email <email>
 *
 * Passwords are prompted for interactively, so they never appear in shell history.
 * Uses the same hashing library and defaults as nuxt-auth-utils (ADR-001).
 */
import { parseArgs } from 'node:util'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../server/models/User.ts'
import { staffPasswordSchema } from '../shared/schemas/auth.ts'

const USAGE = `Usage:
  pnpm staff create --email <email> --name "<full name>"
  pnpm staff set-password --email <email>
  pnpm staff deactivate --email <email>`

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin
    if (!stdin.isTTY) {
      reject(new Error('Run this command in an interactive terminal.'))
      return
    }

    process.stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let input = ''
    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
      process.stdout.write('\n')
    }
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          cleanup()
          resolve(input)
          return
        }
        if (char === '\u0003') {
          cleanup()
          reject(new Error('Cancelled.'))
          return
        }
        if (char === '\u007F' || char === '\b') {
          input = input.slice(0, -1)
          continue
        }
        input += char
      }
    }
    stdin.on('data', onData)
  })
}

/** Prompts twice for a new password and returns its hash. */
async function promptNewPasswordHash(): Promise<string> {
  const password = await promptHidden('Password: ')
  const passwordCheck = staffPasswordSchema.safeParse(password)
  if (!passwordCheck.success) {
    throw new Error(passwordCheck.error.issues[0]?.message ?? 'Invalid password.')
  }
  if (password !== await promptHidden('Confirm password: ')) {
    throw new Error('Passwords do not match.')
  }
  return new Hash(new Scrypt({})).make(password)
}

async function createStaff(email: string, name: string) {
  if (await User.exists({ email })) {
    throw new Error(`A staff account with email ${email} already exists.`)
  }

  const passwordHash = await promptNewPasswordHash()
  await User.create({ email, name, passwordHash })
  console.info(`Created staff account for ${name} <${email}>.`)
}

/** Sets a new password and signs the account out of existing sessions. */
async function setStaffPassword(email: string) {
  if (!(await User.exists({ email }))) {
    throw new Error(`No staff account with email ${email}.`)
  }

  const passwordHash = await promptNewPasswordHash()
  await User.updateOne({ email }, { passwordHash, passwordChangedAt: new Date() })
  console.info(`Password updated for ${email}. Existing sessions for this account are signed out.`)
}

async function deactivateStaff(email: string) {
  const result = await User.updateOne({ email }, { active: false })
  if (result.matchedCount === 0) {
    throw new Error(`No staff account with email ${email}.`)
  }
  console.info(`Deactivated staff account ${email}.`)
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { email: { type: 'string' }, name: { type: 'string' } },
  })
  const command = positionals[0]

  const email = z.email().safeParse(values.email?.trim().toLowerCase())
  if (!email.success) {
    throw new Error(`A valid --email is required.\n\n${USAGE}`)
  }

  const uri = process.env.NUXT_MONGODB_URI
  if (!uri) {
    throw new Error('NUXT_MONGODB_URI is not set. See docs/development.md.')
  }

  await mongoose.connect(uri)
  try {
    if (command === 'create') {
      const name = values.name?.trim()
      if (!name) {
        throw new Error(`--name is required.\n\n${USAGE}`)
      }
      await createStaff(email.data, name)
    }
    else if (command === 'set-password') {
      await setStaffPassword(email.data)
    }
    else if (command === 'deactivate') {
      await deactivateStaff(email.data)
    }
    else {
      throw new Error(USAGE)
    }
  }
  finally {
    await mongoose.disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
