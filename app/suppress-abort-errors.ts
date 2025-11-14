// Suppress AbortError from Next.js dev overlay
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = window.Error
  
  // Override global Error constructor
  const CustomError = class AbortFilteredError extends Error {
    constructor(message?: string) {
      super(message)
      if (typeof message === 'string' && message.includes('aborted')) {
        this.name = 'SuppressedAbortError'
      }
    }
  }
  
  // Preserve prototype chain
  Object.setPrototypeOf(CustomError.prototype, originalError.prototype)
  window.Error = CustomError as any  // Suppress in dev overlay
  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    const firstArg = args[0]
    if (firstArg instanceof Error && (firstArg.name === 'AbortError' || (firstArg as any).__suppressed)) {
      return
    }
    if (typeof firstArg === 'string' && firstArg.includes('signal is aborted')) {
      return
    }
    originalConsoleError(...args)
  }
}

export {}
