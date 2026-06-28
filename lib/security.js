/**
 * Security Utilities
 * IP and session helpers for rate limiting.
 */

/**
 * Extract IP address from request
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'no-ip-detected';
}

/**
 * Get session identifier from request (cookie or header)
 * @param {Request} request - Next.js request object
 * @returns {string|null} Session ID if present
 */
export function getSessionID(request) {
  const sessionHeader = request.headers.get('x-session-id');
  if (sessionHeader) {
    return sessionHeader;
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    return cookies['session-id'] || null;
  }

  return null;
}

/**
 * Get combined identifier for rate limiting (IP + Session)
 * @param {Request} request - Next.js request object
 * @returns {string} Combined identifier
 */
export function getRateLimitIdentifier(request, userId = null) {
  if (userId) {
    return `user:${userId}`;
  }

  const ip = getClientIP(request);
  const sessionId = getSessionID(request);

  if (sessionId) {
    return `session:${sessionId}:${ip}`;
  }

  return `ip:${ip}`;
}
