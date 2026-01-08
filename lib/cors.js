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
  
    // Add production domain if set
    const productionDomain = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (productionDomain) {
      const prodOrigin = productionDomain.startsWith('http') 
        ? productionDomain 
        : `https://${productionDomain}`;
      defaultOrigins.push(prodOrigin);
    }
  
    return defaultOrigins;
  }
  
  /**
   * Check if origin is allowed
   * @param {string} origin - Request origin
   * @returns {boolean} True if origin is allowed
   */
  function isOriginAllowed(origin) {
    if (!origin) return false;
    
    const allowedOrigins = getAllowedOrigins();
    
    // In development, allow localhost variations
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
      }
    }
    
    return allowedOrigins.includes(origin);
  }
  
  /**
   * Get CORS headers for a request
   * @param {Request} request - Next.js request object
   * @returns {Object} Headers object with CORS configuration
   */
  export function getCORSHeaders(request) {
    const origin = request.headers.get('origin');
    const isAllowed = origin && isOriginAllowed(origin);
    
    const headers = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Access-Control-Allow-Credentials': 'true',
    };
  
    // Only set Allow-Origin if origin is allowed (prevents CORS errors while maintaining security)
    if (isAllowed) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow the request origin for easier testing
      headers['Access-Control-Allow-Origin'] = origin || '*';
    } else {
      // In production, reject unauthorized origins
      headers['Access-Control-Allow-Origin'] = getAllowedOrigins()[0] || 'null';
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
    
    // Same-origin requests (no origin header) are always allowed
    if (!origin) return true;
    
    return isOriginAllowed(origin);
  }
  
  