import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Development-only logger that is stripped in production builds
 * Usage: devLog('message', data)
 */
export const devLog = process.env.NODE_ENV === 'development' 
  ? (message: string, ...args: unknown[]) => console.log(`[DEV] ${message}`, ...args)
  : () => {} // No-op in production

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * Unlike debounce, this will invoke immediately and then throttle subsequent calls.
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - lastTime)
    
    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      func.apply(this, args)
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        func.apply(this, args)
      }, remaining)
    }
  }
}
