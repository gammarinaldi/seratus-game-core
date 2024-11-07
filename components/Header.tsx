import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from './ui/button'

export async function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-background border-b">
      <Link href="/" className="text-2xl font-bold text-primary bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Seratus
      </Link>
      <div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Login
          </Button>
        </SignInButton>
      </SignedOut>
      </div>
    </header>
  )
}
