/**
 * Security headers applied to all routes in production.
 * HSTS is omitted in development to avoid pinning HTTP localhost.
 */

const BASE_SECURITY_HEADERS = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const PRODUCTION_ONLY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

export function getSecurityHeaders() {
  const headers = [...BASE_SECURITY_HEADERS];
  if (process.env.NODE_ENV === 'production') {
    headers.push(...PRODUCTION_ONLY_HEADERS);
  }
  return headers;
}

export const securityHeaderRoute = {
  source: '/:path*',
  headers: getSecurityHeaders(),
};
