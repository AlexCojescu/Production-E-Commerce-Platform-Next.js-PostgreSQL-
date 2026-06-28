/** @typedef {'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic'} DetectedImageType */

/** Stay under Vercel serverless payload limit (~4.5 MB) including multipart overhead. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB

const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'])

/**
 * Detect image type from file magic bytes (does not trust client MIME type).
 * @param {Buffer} buffer
 * @returns {DetectedImageType | null}
 */
export function detectImageTypeFromBuffer(buffer) {
  if (!buffer || buffer.length < 12) return null

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }

  if (buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12)
    if (HEIC_BRANDS.has(brand)) {
      return 'image/heic'
    }
  }

  const preview = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8').trimStart().toLowerCase()
  if (
    preview.startsWith('<!doctype') ||
    preview.startsWith('<html') ||
    preview.startsWith('<svg') ||
    preview.startsWith('<?xml') ||
    preview.includes('<script')
  ) {
    return null
  }

  return null
}

/**
 * @param {Buffer} buffer
 * @param {{ maxBytes?: number }} [options]
 * @returns {{ detectedType: DetectedImageType, safeFileName: string }}
 */
export function validateImageUploadBuffer(buffer, options = {}) {
  const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES

  if (!buffer?.length) {
    throw new UploadValidationError('Empty file')
  }

  if (buffer.length > maxBytes) {
    throw new UploadValidationError(`File exceeds maximum size of ${maxBytes} bytes`)
  }

  const detectedType = detectImageTypeFromBuffer(buffer)
  if (!detectedType) {
    throw new UploadValidationError('Invalid image file. Only JPEG, PNG, WebP, and HEIC are allowed.')
  }

  return {
    detectedType,
    safeFileName: buildSafeUploadFileName(detectedType),
  }
}

/**
 * @param {DetectedImageType} detectedType
 * @param {string} [originalName]
 */
export function buildSafeUploadFileName(detectedType, originalName = 'upload') {
  const ext = EXTENSION_BY_TYPE[detectedType] || 'bin'
  const base = String(originalName)
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 48) || 'upload'

  return `${base}.${ext}`
}

export class UploadValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UploadValidationError'
  }
}
