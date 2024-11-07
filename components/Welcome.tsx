import { SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Welcome() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Selamat Datang di Seratus Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Buktikan kalo kamu bukan SDM rendah!
        </p>
      </CardContent>
      <CardFooter>
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Login dulu
            </Button>
          </SignInButton>
        </SignedOut>
      </CardFooter>
    </Card>
  )
}
