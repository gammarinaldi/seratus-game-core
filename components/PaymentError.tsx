import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function PaymentError({ orderId }: { orderId: string }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <CardTitle className="text-destructive">Payment Error</CardTitle>
        </div>
        <CardDescription>
            We could not receive your payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
            Please check your payment details and try again. If the problem persists, 
            <a href={"mailto:gammarinaldi@gmail.com?subject=Payment Error: " + orderId} 
            className="text-primary hover:underline">contact our support team</a> for assistance.
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/pricing" passHref>
          <Button className="w-full">
            Try Again
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}