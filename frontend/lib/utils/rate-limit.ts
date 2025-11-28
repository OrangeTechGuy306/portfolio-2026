import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; remaining: number; resetTime: number } => {
    // Get client identifier (IP address or user ID)
    const identifier = getClientIdentifier(request);
    const now = Date.now();
    
    // Initialize or get existing rate limit data
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 0,
        resetTime: now + config.interval,
      };
    }

    // Increment request count
    store[identifier].count++;

    // Check if limit exceeded
    const remaining = Math.max(0, config.maxRequests - store[identifier].count);
    const success = store[identifier].count <= config.maxRequests;

    return {
      success,
      remaining,
      resetTime: store[identifier].resetTime,
    };
  };
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),

  // Standard rate limit for API endpoints
  api: rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),

  // Lenient rate limit for public endpoints
  public: rateLimit({
    interval: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Strict rate limit for contact form
  contact: rateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  }),
};

