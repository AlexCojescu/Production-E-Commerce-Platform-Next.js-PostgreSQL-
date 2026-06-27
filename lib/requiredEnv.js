/**
 * Required environment validation and admin email helpers.
 * Fails closed: missing auth secrets deny access rather than allowing forged tokens.
 */

import { isValidEmail } from './inputLimits.js'

const AUTH_SECRETS = ['CLERK_SECRET_KEY', 'ADMIN_EMAIL']

const PRODUCTION_SECRETS = [
  ...AUTH_SECRETS,
  'STRIPE_WEBHOOK_SECRET',
  'DATABASE_URL',
]

export function parseAdminEmails(raw) {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => isValidEmail(email))
}

export function isAdminEmail(email) {
  if (!email?.trim()) return false
  return parseAdminEmails(process.env.ADMIN_EMAIL).includes(email.trim().toLowerCase())
}

export function isAdminEmailConfigured() {
  return parseAdminEmails(process.env.ADMIN_EMAIL).length > 0
}

export function assertAuthSecretsConfigured(context = 'request') {
  const missing = AUTH_SECRETS.filter((key) => !process.env[key]?.trim())
  if (missing.length > 0) {
    throw new Error(`Missing required auth secrets (${context}): ${missing.join(', ')}`)
  }
  if (!isAdminEmailConfigured()) {
    throw new Error(`ADMIN_EMAIL is not configured (${context})`)
  }
}

export function validateRequiredEnv({ crash = process.env.NODE_ENV === 'production' } = {}) {
  const varsToCheck =
    process.env.NODE_ENV === 'production' ? PRODUCTION_SECRETS : AUTH_SECRETS

  const missing = varsToCheck.filter((key) => !process.env[key]?.trim())

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`
    if (crash) {
      throw new Error(message)
    }
    console.warn(`[security] ${message}`)
    return { ok: false, missing }
  }

  if (!isAdminEmailConfigured()) {
    const message = 'ADMIN_EMAIL is set but contains no valid email addresses'
    if (crash) {
      throw new Error(message)
    }
    console.warn(`[security] ${message}`)
    return { ok: false, missing: ['ADMIN_EMAIL'] }
  }

  return { ok: true, missing: [] }
}
