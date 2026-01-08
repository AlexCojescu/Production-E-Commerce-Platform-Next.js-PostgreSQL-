/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting with configurable windows and limits
 * 
 * PRODUCTION NOTE: For production with multiple serverless instances, migrate to Redis
 * or a managed rate-limit service (e.g., Upstash, Vercel KV) to prevent instance-hopping
 * attacks where attackers bypass limits by hitting different instances.
 * 
 * Example Redis implementation:
 * ```javascript
 * import { Redis } from '@upstash/redis';
 * const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
 * 
 * async function checkLimit(identifier, maxRequests, windowMs) {
 *   const key = `ratelimit:${identifier}`;
 *   const current = await redis.incr(key);
 *   if (current === 1) await redis.expire(key, Math.ceil(windowMs / 1000));
 *   return { allowed: current <= maxRequests, remaining: Math.max(0, maxRequests - current) };
 * }
 * ```
 */

class RateLimiter {
    constructor() {
      this.requests = new Map();
      this.cleanupInterval = null;
      this.startCleanup();
    }
  
    /**
     * Check if a request should be rate limited
     * @param {string} identifier - Unique identifier (IP, userId, etc.)
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
     */
    checkLimit(identifier, maxRequests = 10, windowMs = 60000) {
      const now = Date.now();
      const key = `${identifier}:${maxRequests}:${windowMs}`;
      
      if (!this.requests.has(key)) {
        this.requests.set(key, {
          count: 1,
          resetAt: new Date(now + windowMs),
          firstRequest: now
        });
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: new Date(now + windowMs)
        };
      }
  
      const record = this.requests.get(key);
      
      // Reset if window has passed
      if (now > record.resetAt.getTime()) {
        record.count = 1;
        record.resetAt = new Date(now + windowMs);
        record.firstRequest = now;
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: record.resetAt
        };
      }
  
      // Check if limit exceeded
      if (record.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: record.resetAt
        };
      }
  
      // Increment and allow
      record.count++;
      return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetAt: record.resetAt
      };
    }
  
    /**
     * Clean up expired entries periodically
     */
    startCleanup() {
      if (this.cleanupInterval) return;
      
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
          if (now > record.resetAt.getTime()) {
            this.requests.delete(key);
          }
        }
      }, 60000); // Clean up every minute
    }
  
    stopCleanup() {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
    }
  }
  
  // Singleton instance
  const rateLimiter = new RateLimiter();
  
  export default rateLimiter;
  
  