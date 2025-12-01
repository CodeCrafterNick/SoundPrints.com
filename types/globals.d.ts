// Extend Clerk's session claims to include custom metadata
export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'admin' | 'user'
    }
  }
}
