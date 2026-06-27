const PROFILE_IMAGE_HOSTS = [
  'img.clerk.com',
  'images.clerk.dev',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'platform-lookaside.fbsbx.com',
  'graph.facebook.com',
]

const BLOCKED_URL_SCHEMES = /^(javascript|data|vbscript|blob):/i

/**
 * @param {string | null | undefined} url
 */
export function isBlockedUrlScheme(url) {
  if (typeof url !== 'string') return true
  const trimmed = url.trim()
  if (!trimmed) return true
  return BLOCKED_URL_SCHEMES.test(trimmed)
}

/**
 * @param {string | null | undefined} url
 */
export function isAllowedImageKitUrl(url) {
  if (typeof url !== 'string' || !url.trim() || isBlockedUrlScheme(url)) {
    return false
  }

  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol !== 'https:') return false

    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT
    if (endpoint) {
      const allowedHost = new URL(endpoint).hostname
      if (parsed.hostname === allowedHost) return true
    }

    return parsed.hostname.endsWith('.imagekit.io') || parsed.hostname === 'ik.imagekit.io'
  } catch {
    return false
  }
}

/**
 * @param {string | null | undefined} url
 */
export function isAllowedProfileImageUrl(url) {
  if (typeof url !== 'string' || !url.trim() || isBlockedUrlScheme(url)) {
    return false
  }

  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol !== 'https:') return false

    return PROFILE_IMAGE_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

/**
 * @param {string | null | undefined} url
 * @param {string} [fallback='']
 */
export function sanitizeProfileImageUrl(url, fallback = '') {
  return isAllowedProfileImageUrl(url) ? url.trim() : fallback
}

/**
 * @param {unknown} urls
 * @returns {string[]}
 */
export function filterAllowedImageKitUrls(urls) {
  if (!Array.isArray(urls)) return []
  return urls.filter((url) => isAllowedImageKitUrl(url))
}

/**
 * @param {unknown} urls
 */
export function assertAllowedImageKitUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('At least one image URL is required')
  }

  const invalid = urls.filter((url) => !isAllowedImageKitUrl(url))
  if (invalid.length > 0) {
    throw new Error('One or more image URLs are not from the allowed image host')
  }

  return urls
}

/**
 * @param {string | null | undefined} url
 * @param {string} fallback
 */
export function safeImageSrc(url, fallback = '/default-avatar.png') {
  if (typeof url !== 'string' || !url.trim()) return fallback
  if (url.startsWith('/')) return url
  if (isAllowedImageKitUrl(url) || isAllowedProfileImageUrl(url)) return url.trim()
  return fallback
}
