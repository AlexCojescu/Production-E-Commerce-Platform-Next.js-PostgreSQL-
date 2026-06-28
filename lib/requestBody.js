export const MAX_JSON_BODY_BYTES = 1024 * 1024 // 1 MB — defense-in-depth under Vercel's ~4.5 MB gateway cap

/** Stripe webhook payloads are small; cap before buffering raw body. */
export const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024 // 1 MB

export class BodyTooLargeError extends Error {
  constructor(message = 'Request body too large') {
    super(message)
    this.name = 'BodyTooLargeError'
  }
}

export class InvalidJsonError extends Error {
  constructor(message = 'Invalid JSON in request body') {
    super(message)
    this.name = 'InvalidJsonError'
  }
}

/**
 * Reject oversized bodies before buffering (uses Content-Length when present).
 * @param {Request} request
 * @param {number} [maxBytes=MAX_JSON_BODY_BYTES]
 */
export function assertBodySizeWithin(request, maxBytes = MAX_JSON_BODY_BYTES) {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const length = Number(contentLength)
    if (Number.isFinite(length) && length > maxBytes) {
      throw new BodyTooLargeError()
    }
  }
}

/**
 * Read raw text with a strict byte-size cap (for webhooks that need the raw body).
 * @param {Request} request
 * @param {number} [maxBytes=MAX_JSON_BODY_BYTES]
 */
export async function parseTextBody(request, maxBytes = MAX_JSON_BODY_BYTES) {
  assertBodySizeWithin(request, maxBytes)
  const text = await request.text()
  if (text.length > maxBytes) {
    throw new BodyTooLargeError()
  }
  return text
}

/**
 * Parse JSON with a strict byte-size cap (Content-Length pre-check + measured body).
 * @param {Request} request
 * @param {number} [maxBytes=MAX_JSON_BODY_BYTES]
 */
export async function parseJsonBody(request, maxBytes = MAX_JSON_BODY_BYTES) {
  assertBodySizeWithin(request, maxBytes)

  const text = await request.text()
  if (text.length > maxBytes) {
    throw new BodyTooLargeError()
  }

  if (!text.trim()) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new InvalidJsonError()
  }
}
