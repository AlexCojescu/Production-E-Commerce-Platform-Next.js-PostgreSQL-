/**
 * Log Scrubber Utility
 * Removes PII and sensitive information from logs
 */

/**
 * Patterns for detecting PII and sensitive data
 */
const PII_PATTERNS = {
    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // Phone numbers (various formats)
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    
    // Credit card numbers (basic pattern)
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    
    // SSN (US Social Security Numbers)
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    
    // Order IDs (common patterns)
    orderId: /\b(?:order|ord)[-_\s]?[A-Z0-9]{6,}\b/gi,
    
    // API keys (basic pattern)
    apiKey: /\b(?:sk|pk|AKIA|AIza)[-_]?[A-Za-z0-9]{20,}\b/g,
    
    // IP addresses (all ranges)
    ipAddress:
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,

    // IPv6 addresses (simplified)
    ipv6: /\b(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\b/g,

    // IP addresses (private ranges) — kept for explicit coverage
    privateIP: /\b(?:10|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g,
  };
  
  const SENSITIVE_LOG_KEYS = new Set([
    'email',
    'ip',
    'ipaddress',
    'clientip',
    'referer',
    'origin',
    'host',
  ]);
  
  /**
   * Scrub PII from a string
   * @param {string} text - Text to scrub
   * @param {string} replacement - Replacement string (default: '[REDACTED]')
   * @returns {string} Scrubbed text
   */
  export function scrubPII(text, replacement = '[REDACTED]') {
    if (typeof text !== 'string') {
      return text;
    }
    
    let scrubbed = text;
    
    // Apply all PII patterns
    Object.values(PII_PATTERNS).forEach(pattern => {
      scrubbed = scrubbed.replace(pattern, replacement);
    });
    
    return scrubbed;
  }
  
  /**
   * Scrub PII from an object recursively
   * @param {any} obj - Object to scrub
   * @param {string[]} allowedKeys - Keys that should not be scrubbed (e.g., ['userId', 'timestamp'])
   * @param {string} replacement - Replacement string
   * @returns {any} Scrubbed object
   */
  export function scrubObject(obj, allowedKeys = [], replacement = '[REDACTED]') {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'string') {
      return scrubPII(obj, replacement);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => scrubObject(item, allowedKeys, replacement));
    }
    
    if (typeof obj === 'object') {
      const scrubbed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (allowedKeys.includes(key)) {
          scrubbed[key] = value;
        } else if (SENSITIVE_LOG_KEYS.has(key.toLowerCase())) {
          scrubbed[key] = replacement;
        } else if (typeof value === 'string') {
          scrubbed[key] = scrubPII(value, replacement);
        } else {
          scrubbed[key] = scrubObject(value, allowedKeys, replacement);
        }
      }
      return scrubbed;
    }
    
    return obj;
  }
  
  /**
   * Safe logger that automatically scrubs PII
   * @param {string} level - Log level (info, error, warn, debug)
   * @param {string} message - Log message
   * @param {any} data - Additional data to log (will be scrubbed)
   */
  export function safeLog(level, message, data = null) {
    const scrubbedData = data ? scrubObject(data, ['userId', 'timestamp', 'tokens']) : null;
    
    const logEntry = {
      level,
      message: scrubPII(message),
      timestamp: new Date().toISOString(),
      ...(scrubbedData && { data: scrubbedData }),
    };
    
    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry));
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(JSON.stringify(logEntry));
        }
        break;
      default:
        console.log(JSON.stringify(logEntry));
    }
  }
  
  