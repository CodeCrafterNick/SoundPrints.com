'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartDialog } from '@/components/cart/cart-dialog'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { User, Package } from 'lucide-react'

export function SiteHeader() {
  const { isSignedIn, user } = useUser()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer">
              SoundPrints
            </h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/create">
              <Button variant="ghost">Create</Button>
            </Link>
            
            {isSignedIn ? (
              <>
                <Link href="/my-orders">
                  <Button variant="ghost" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            )}
            
            <CartDialog />
          </nav>
        </div>
      </div>
    </header>
  )
}
