/**
 * CORS Configuration Utility
 * Provides secure CORS headers with origin allowlist
 */

/**
 * Get allowed origins from environment or use defaults
 * @returns {string[]} Array of allowed origins
 */
function getAllowedOrigins() {
    // Get from environment variable (comma-separated)
    const envOrigins = process.env.CHATBOT_ALLOWED_ORIGINS;
    if (envOrigins) {
      return envOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
    }
  
    // Default allowed origins for Vette Archive
    const defaultOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
    ];
  
    // Add production domain if set - check multiple Vercel env vars
    const productionDomain = process.env.NEXT_PUBLIC_SITE_URL || 
                           process.env.VERCEL_URL || 
                           process.env.NEXT_PUBLIC_VERCEL_URL;
    
    if (productionDomain) {
      const prodOrigin = productionDomain.startsWith('http') 
        ? productionDomain 
        : `https://${productionDomain}`;
      defaultOrigins.push(prodOrigin);
      
      // Also add without protocol if it was added
      if (!productionDomain.startsWith('http')) {
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
    
    // Determine protocol - in production it's usually HTTPS
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 
                     (request.headers.get('x-forwarded-proto') || 'http');
    
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
    
    // Always allow same-origin requests (when origin matches the request's host)
    const requestOrigin = getRequestOrigin(request);
    if (requestOrigin && origin === requestOrigin) {
      return true;
    }
    
    const allowedOrigins = getAllowedOrigins();
    
    // In development, allow localhost variations
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
      }
    }
    
    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return true;
    }
    
    // Check if origin is a Vercel deployment URL (allow *.vercel.app domains)
    // This works even if VERCEL env var isn't set, as long as the domain pattern matches
    if (origin.includes('.vercel.app')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get CORS headers for a request
   * @param {Request} request - Next.js request object
   * @returns {Object} Headers object with CORS configuration
   */
  export function getCORSHeaders(request) {
    const origin = request.headers.get('origin');
    const requestOrigin = getRequestOrigin(request);
    
    // Check if this is a same-origin request (no origin header or origin matches host)
    const isSameOrigin = !origin || (requestOrigin && origin === requestOrigin);
    const isAllowed = isSameOrigin || (origin && isOriginAllowed(origin, request));
    
    const headers = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Access-Control-Allow-Credentials': 'true',
    };
  
    // Set Allow-Origin header
    if (isAllowed) {
      // For same-origin requests, use the request's origin or the origin header
      headers['Access-Control-Allow-Origin'] = origin || requestOrigin || '*';
    } else if (process.env.NODE_ENV === 'development') {
      // In development, be more permissive
      headers['Access-Control-Allow-Origin'] = origin || requestOrigin || '*';
    } else {
      // In production, use the request origin if available, otherwise first allowed origin
      headers['Access-Control-Allow-Origin'] = requestOrigin || getAllowedOrigins()[0] || '*';
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
    
    // Same-origin requests (no origin header or origin matches host) are always allowed
    if (!origin) return true;
    
    // Check if origin matches the request's own origin (same-origin request)
    if (requestOrigin && origin === requestOrigin) {
      return true;
    }
    
    return isOriginAllowed(origin, request);
  }
  
  