import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/my-orders(.*)',
])

// Define routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()
  
  // Admin routes require admin role
  if (isAdminRoute(request)) {
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
    
    // Check if user has admin role
    const role = sessionClaims?.metadata?.role as string | undefined
    if (role !== 'admin') {
      // Redirect non-admins to home page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Protected routes just require authentication
  if (isProtectedRoute(request)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
