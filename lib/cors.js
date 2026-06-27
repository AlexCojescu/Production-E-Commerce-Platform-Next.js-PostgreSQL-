/**
 * CORS Configuration Utility
 * Provides secure CORS headers with origin allowlist.
 * Never uses Access-Control-Allow-Origin: * (incompatible with credentials).
 */

/**
 * Get allowed origins from environment or use defaults
 * @returns {string[]} Array of allowed origins
 */
function getAllowedOrigins() {
  const envOrigins = process.env.CHATBOT_ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  const defaultOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
  ];

  const productionDomain =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;

  if (productionDomain) {
    const prodOrigin = productionDomain.startsWith('http')
      ? productionDomain
      : `https://${productionDomain}`;
    defaultOrigins.push(prodOrigin);

    if (process.env.NODE_ENV === 'development' && !productionDomain.startsWith('http')) {
      defaultOrigins.push(`http://${productionDomain}`);
    }
  }

  return defaultOrigins;
}

/**
 * Get the request's own origin (host-based)
 * @param {Request} request - Next.js request object
 * @returns {string|null} The request's origin based on host header
 */
function getRequestOrigin(request) {
  const host = request.headers.get('host');
  if (!host) return null;

  const protocol =
    process.env.NODE_ENV === 'production'
      ? 'https'
      : request.headers.get('x-forwarded-proto') || 'http';

  return `${protocol}://${host}`;
}

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @param {Request} request - Request object to check against
 * @returns {boolean} True if origin is allowed
 */
function isOriginAllowed(origin, request) {
  if (!origin) return false;

  const requestOrigin = getRequestOrigin(request);
  if (requestOrigin && origin === requestOrigin) {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();

  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    const vercelOrigin = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    if (origin === vercelOrigin) {
      return true;
    }
  }

  return false;
}

/**
 * Resolve the single origin value to echo in Allow-Origin
 * @param {Request} request
 * @returns {string|null}
 */
function resolveAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  const requestOrigin = getRequestOrigin(request);

  if (!origin) {
    return requestOrigin;
  }

  if (requestOrigin && origin === requestOrigin) {
    return origin;
  }

  if (isOriginAllowed(origin, request)) {
    return origin;
  }

  return null;
}

/**
 * Get CORS headers for a request.
 * Omits Allow-Origin when the caller is not on the allowlist.
 * @param {Request} request - Next.js request object
 * @returns {Object} Headers object with CORS configuration
 */
export function getCORSHeaders(request) {
  const allowedOrigin = resolveAllowedOrigin(request);

  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers.Vary = 'Origin';
  }

  return headers;
}

/**
 * Validate origin for a request
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if origin is valid
 */
export function validateOrigin(request) {
  const origin = request.headers.get('origin');
  const requestOrigin = getRequestOrigin(request);

  if (!origin) return true;

  if (requestOrigin && origin === requestOrigin) {
    return true;
  }

  return isOriginAllowed(origin, request);
}
