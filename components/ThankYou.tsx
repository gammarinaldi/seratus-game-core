"use client"

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useSearchParams } from 'next/navigation'
import PaymentError from './PaymentError'
import { useUser } from "@clerk/nextjs"
import { PricingPlan } from './PricingPlan'
import { insertRoom } from '@/app/actions/Room'
import { useRouter } from 'next/navigation'

export default function ThankYou() {
    const { user } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const orderId = searchParams.get('order_id')
    const statusCode = searchParams.get('status_code')
    const transactionStatus = searchParams.get('transaction_status')

    if (!orderId) return null

    const initializeRoom = () => {
        setIsCreating(true)
        insertRoom({
          orderId: orderId ?? '',
          createdBy: user?.emailAddresses[0].emailAddress ?? '',
        }).then((data) => {
            const roomId = data._id.toString()
            localStorage.setItem('roomId', roomId)
            router.push(`/create-quiz`)
        })
    }

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user])

    if (statusCode !== '200') return <PaymentError orderId={orderId ?? ''} />
    if (transactionStatus === 'deny') return <PaymentError orderId={orderId ?? ''} />
    if (transactionStatus === 'pending') return <PricingPlan message="Proceed payment as instructed in the payment page." />

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
                <CardDescription>Your payment has been successfully processed.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-sm text-gray-600">
                    Now, you can continue to create your quiz.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <Button 
                    onClick={initializeRoom} 
                    disabled={isCreating} 
                    className="w-full"
                >
                    {isCreating ? 'Loading...' : 'Create Quiz'}
                </Button>
            </CardFooter>
        </Card>
    )
}
