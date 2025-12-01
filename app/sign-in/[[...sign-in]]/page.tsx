import { SignIn } from '@clerk/nextjs'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center bg-background p-4">
        <SignIn />
      </main>
      <SiteFooter />
    </div>
  )
}
