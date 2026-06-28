import { NextResponse } from 'next/server'
import rateLimiter from '@/lib/rateLimit'
import { getRateLimitIdentifier } from '@/lib/security'
import {
  parseJsonBody,
  assertBodySizeWithin,
  BodyTooLargeError,
  InvalidJsonError,
} from '@/lib/requestBody'
import { InputValidationError } from '@/lib/inputLimits'

export { assertBodySizeWithin, BodyTooLargeError } from '@/lib/requestBody'

export const RATE_LIMITS = {
  GLOBAL: { maxRequests: 120, windowMs: 60_000 },
  STRICT: { maxRequests: 10, windowMs: 60_000 },
  MUTATION: { maxRequests: 60, windowMs: 60_000 },
}

/**
 * @param {Request} request
 * @param {{ userId?: string | null, scope?: string, maxRequests?: number, windowMs?: number }} options
 * @returns {NextResponse | null}
 */
export function enforceRateLimit(request, options = {}) {
  const {
    userId = null,
    scope = 'api',
    maxRequests = RATE_LIMITS.MUTATION.maxRequests,
    windowMs = RATE_LIMITS.MUTATION.windowMs,
  } = options

  const identifier = `${scope}:${getRateLimitIdentifier(request, userId)}`
  const result = rateLimiter.checkLimit(identifier, maxRequests, windowMs)

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        resetAt: result.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000))
          ),
        },
      }
    )
  }

  return null
}

/**
 * @param {Request} request
 */
export async function readJsonBody(request) {
  try {
    return { body: await parseJsonBody(request) }
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return { error: NextResponse.json({ error: error.message }, { status: 413 }) }
    }
    if (error instanceof InvalidJsonError) {
      return { error: NextResponse.json({ error: error.message }, { status: 400 }) }
    }
    throw error
  }
}

/**
 * @param {unknown} error
 * @returns {NextResponse | null}
 */
export function inputValidationResponse(error) {
  if (error instanceof InputValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return null
}
