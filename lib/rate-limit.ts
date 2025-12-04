import { NextResponse } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export function rateLimit(config: RateLimitConfig = { interval: 60000, maxRequests: 10 }) {
  return function checkRateLimit(identifier: string): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const key = identifier
    
    let entry = rateLimitStore.get(key)
    
    // Create new entry or reset if expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.interval
      }
    }
    
    entry.count++
    rateLimitStore.set(key, entry)
    
    const remaining = Math.max(0, config.maxRequests - entry.count)
    const resetIn = Math.max(0, entry.resetTime - now)
    
    return {
      success: entry.count <= config.maxRequests,
      remaining,
      resetIn
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimit = rateLimit({ interval: 60000, maxRequests: 60 }) // 60 per minute
export const uploadRateLimit = rateLimit({ interval: 60000, maxRequests: 10 }) // 10 per minute
export const paymentRateLimit = rateLimit({ interval: 60000, maxRequests: 5 }) // 5 per minute

// Helper to get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available identifier
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown'
  
  return ip
}

// Create rate limit response
export function rateLimitResponse(resetIn: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetIn / 1000)),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000 + resetIn / 1000))
      }
    }
  )
}
