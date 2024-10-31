import { SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Welcome() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to Seratus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          AI-Powered Trivia Quiz
        </p>
        <p className="text-center text-muted-foreground">
          Let&apos;s create some fun!
        </p>
      </CardContent>
      <CardFooter>
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Sign In to Get Started
            </Button>
          </SignInButton>
        </SignedOut>
      </CardFooter>
    </Card>
  )
}
