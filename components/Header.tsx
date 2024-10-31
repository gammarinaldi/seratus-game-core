import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from './ui/button'

export async function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-background border-b">
      <Link href="/" className="text-2xl font-bold text-primary">
        Seratus
      </Link>
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
