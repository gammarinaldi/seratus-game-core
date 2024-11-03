"use client"

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useSearchParams } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import { PricingPlan } from './PricingPlan'
import { createRoom, fetchRoomByCreatedBy } from '@/app/actions/Room'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@radix-ui/react-toast'
import PaymentError from './PaymentError'
import { setData } from '@/lib/indexeddb'

export default function ThankYou() {
    const { user, isLoaded } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const orderId = searchParams.get('order_id')
    const statusCode = searchParams.get('status_code')
    const transactionStatus = searchParams.get('transaction_status')
    const { toast } = useToast()    

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/');
        }
    }, [user, router, isLoaded]);

    if (!orderId) return <PaymentError orderId={orderId ?? ''} />
    if (statusCode !== '200') return <PaymentError orderId={orderId ?? ''} />
    if (transactionStatus === 'deny') return <PaymentError orderId={orderId ?? ''} />
    if (transactionStatus === 'pending') return <PricingPlan message="Proceed payment as instructed in the payment page." />

    const handleCreateQuiz = async () => {
        setIsCreating(true)
        const room = await fetchRoomByCreatedBy(user?.emailAddresses[0].emailAddress ?? '', 'waiting');
        if (room) {
            router.push(`/create-room`);
            return;
        }

        const planName = orderId.split('-')[0]
        let maxPlayers = 0
        let maxQuestions = 0

        if (planName === "pro") {
            maxPlayers = 20
            maxQuestions = 15
        } else {
            maxPlayers = 60
            maxQuestions = 30
        }

        try{
            const roomData = await createRoom({
              createdBy: user?.emailAddresses[0].emailAddress ?? '',
              totalPlayers: maxPlayers,
              totalQuestions: maxQuestions,
              plan: planName,
              orderId,
            });
  
            if (roomData) {
              const roomId = roomData._id.toString();
              const roomCode = roomData.roomCode;
              await setData('gameSettings', {
                roomId,
                roomCode,
                maxPlayers,
                maxQuestions,
              });
            }

            router.push(`/create-room`);
          } catch (error) {
            console.error('Error in handlePlanClick:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create room",
                action: <ToastAction altText="Okay">Okay</ToastAction>,
            });
        }
    }

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
                    onClick={handleCreateQuiz} 
                    disabled={isCreating} 
                    className="w-full"
                >
                    {isCreating ? 'Loading...' : 'Create Quiz'}
                </Button>
            </CardFooter>
        </Card>
    )
}
