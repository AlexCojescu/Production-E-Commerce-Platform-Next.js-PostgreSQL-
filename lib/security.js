/**
 * Security Utilities
 * Provides XSS protection, input sanitization, and prompt injection detection
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 5000); // Limit length
  }
  
  /**
   * Detect potential prompt injection attacks
   * @param {string} input - User input to check
   * @returns {boolean} True if suspicious patterns detected
   */
  export function detectPromptInjection(input) {
    if (typeof input !== 'string') return false;
    
    // Normalize to lowercase for case-insensitive matching
    const normalized = input.toLowerCase();
    
    const suspiciousPatterns = [
      // Classic prompt injection patterns
      /ignore\s+(previous|above|all)\s+instructions?/,
      /forget\s+(everything|all|previous)/,
      /you\s+are\s+now\s+(a|an)\s+/,
      /system\s*:\s*/,
      /assistant\s*:\s*/,
      /\[INST\]/,
      /<\|im_start\|>/,
      /<\|im_end\|>/,
      /role\s*:\s*(system|assistant)/,
      /act\s+as\s+(if\s+)?you\s+are/,
      /pretend\s+you\s+are/,
      /disregard\s+(the\s+)?(above|previous|following)/,
      /new\s+instructions?/,
      /override/,
      /bypass/,
      
      // System prompt extraction attempts
      /reveal\s+(your\s+)?(system\s+)?prompt/,
      /show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions?)/,
      /what\s+are\s+(your\s+)?(system\s+)?(prompt|instructions?)/,
      /print\s+(your\s+)?(system\s+)?(prompt|instructions?)/,
      /output\s+(your\s+)?(system\s+)?(prompt|instructions?)/,
      /display\s+(your\s+)?(system\s+)?(prompt|instructions?)/,
      
      // Security rule bypass attempts
      /ignore\s+(security|safety|guardrails?|rules?)/,
      /bypass\s+(security|safety|guardrails?|rules?)/,
      /disable\s+(security|safety|guardrails?|rules?)/,
      /remove\s+(security|safety|guardrails?|rules?)/,
      /skip\s+(security|safety|guardrails?|rules?)/,
      
      // Instruction manipulation
      /replace\s+(your\s+)?instructions?/,
      /change\s+(your\s+)?instructions?/,
      /modify\s+(your\s+)?instructions?/,
      /update\s+(your\s+)?instructions?/,
      
      // Context manipulation
      /clear\s+(the\s+)?(context|history|conversation)/,
      /reset\s+(the\s+)?(context|history|conversation)/,
      /start\s+(over|fresh|new)/,
    ];
  
    return suspiciousPatterns.some(pattern => pattern.test(normalized));
  }
  
  /**
   * Validate AI response for sensitive information leakage
   * @param {string} text - AI response text to validate
   * @returns {boolean} True if response contains sensitive information
   */
  export function validateResponse(text) {
    if (typeof text !== 'string') return false;
    
    const normalized = text.toLowerCase();
    
    // Patterns that indicate potential secret leakage
    const sensitivePatterns = [
      /openai[_\s-]?api[_\s-]?key/i,
      /api[_\s-]?key/i,
      /secret[_\s-]?key/i,
      /private[_\s-]?key/i,
      /vercel[_\s-]?token/i,
      /process\.env\./i,
      /\.env/i,
      /database[_\s-]?url/i,
      /connection[_\s-]?string/i,
      /password\s*[:=]/i,
      /token\s*[:=]/i,
      /credential/i,
      /\/\.env/i, // File paths
      /\/etc\//i, // System paths
      /\/var\//i, // System paths
      /\/usr\//i, // System paths
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(normalized));
  }
  
  /**
   * Validate message structure
   * @param {Object} message - Message object to validate
   * @returns {boolean} True if valid
   */
  export function validateMessage(message) {
    if (!message || typeof message !== 'object') return false;
    if (!message.role || !['system', 'user', 'assistant'].includes(message.role)) return false;
    if (!message.content || typeof message.content !== 'string') return false;
    if (message.content.length > 5000) return false;
    return true;
  }
  
  /**
   * Validate messages array
   * @param {Array} messages - Array of message objects
   * @returns {boolean} True if valid
   */
  export function validateMessages(messages) {
    if (!Array.isArray(messages)) return false;
    if (messages.length === 0 || messages.length > 50) return false; // Reasonable limits
    return messages.every(validateMessage);
  }
  
  /**
   * Extract IP address from request
   * @param {Request} request - Next.js request object
   * @returns {string} IP address
   */
  export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    // Never return 'unknown' - use a fallback that still provides some rate limiting
    // In production, this should be combined with session ID
    return 'no-ip-detected';
  }
  
  /**
   * Get session identifier from request (cookie or header)
   * @param {Request} request - Next.js request object
   * @returns {string|null} Session ID if present
   */
  export function getSessionID(request) {
    // Check for custom session header
    const sessionHeader = request.headers.get('x-session-id');
    if (sessionHeader) {
      return sessionHeader;
    }
    
    // Check for session cookie
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      
      return cookies['chatbot-session-id'] || cookies['session-id'] || null;
    }
    
    return null;
  }
  
  /**
   * Get combined identifier for rate limiting (IP + Session)
   * @param {Request} request - Next.js request object
   * @returns {string} Combined identifier
   */
  export function getRateLimitIdentifier(request, userId = null) {
    // Prefer authenticated user ID
    if (userId) {
      return `user:${userId}`;
    }
    
    const ip = getClientIP(request);
    const sessionId = getSessionID(request);
    
    // Combine IP with session ID for better tracking
    if (sessionId) {
      return `session:${sessionId}:${ip}`;
    }
    
    // Fallback to IP only (but never 'unknown')
    return `ip:${ip}`;
  }
  
  