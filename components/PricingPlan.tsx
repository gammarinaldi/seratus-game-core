"use client"

// This code block extends the global Window interface to include the 'snap' property.
// It's necessary when using TypeScript with external libraries or APIs that aren't
// typed by default, such as the Snap payment gateway.
declare global {
  // Extends the Window interface globally
  interface Window {
    // Adds a 'snap' property to the Window object
    snap: {
      // Defines a 'pay' method on the 'snap' object
      // This method takes a string parameter 'token' and returns void
      pay: (token: string) => void;
      onSuccess: (result: MidtransResult) => void;
      onPending: (result: MidtransResult) => void;
      onError: (result: MidtransResult) => void;
      onClose: () => void;
    }
  }
}
// This declaration allows TypeScript to recognize 'window.snap.pay(token)'
// as a valid method call without throwing type errors.
// It's particularly useful when integrating third-party scripts that modify
// the global window object, ensuring type safety in your TypeScript code.

// Add payment result interfaces
interface MidtransResult {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
}

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs";
import { ToastAction } from "@/components/ui/toast"
import { updateUserField } from "@/app/actions/User"
import { fetchRoomByCreatedBy, insertRoom } from "@/app/actions/Room";
import type { StoredData } from '@/app/types/storage';
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Basic",
    price: 0,
    priceText: "Free",
    maxPlayers: 6,
    maxQuestions: 1,
    timer: 5,
    features: [
      { name: "Up to 6 players", included: true },
      { name: "1 questions per topic", included: true },
      { name: "Custom questions", included: false },
    ],
  },
  {
    name: "Pro",
    price: 25000,
    priceText: "25rb",
    maxPlayers: 10,
    maxQuestions: 2,
    timer: 5,
    features: [
      { name: "Up to 10 players", included: true },
      { name: "2 questions per topic", included: true },
      { name: "Custom questions", included: false },
    ],
  },
  {
    name: "Premium",
    price: 75000,
    priceText: "75rb",
    maxPlayers: 50,
    maxQuestions: 3,
    timer: 5,
    features: [
      { name: "Up to 50 players", included: true },
      { name: "3 questions per topic", included: true },
      { name: "Custom questions", included: true },
    ],
  },
]

// Add IndexedDB utility functions at the top of the file
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('quiz', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('gameData')) {
                db.createObjectStore('gameData');
            }
        };
        
        request.onsuccess = () => resolve(request.result);
    });
};

const setData = async <K extends keyof StoredData>(key: K, value: StoredData[K]) => {
    const db = await initDB() as IDBDatabase;
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

export function PricingPlan({ message }: { message: string }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { user } = useUser()

  if (message) {
    toast({
      title: "Your payment is pending.",
      description: message,
      action: <ToastAction altText="Understood">Understood</ToastAction>,
    })
  }

  const handlePlanClick = async (
    planName: string, 
    price: number, 
    maxPlayers: number, 
    maxQuestions: number, 
    timer: number
  ) => {
    if (!user) {
      toast({
        variant: 'destructive',
        description: "Oops! Something went wrong. Please try again.",
        duration: 5000,
        action: <ToastAction altText="Understood">Understood</ToastAction>
      });
      return;
    }
    
    setSelectedPlan(planName);
    setLoading(true);

    if (planName === "Basic") {
        try {
            await updateUserField(user.id, { plan: 'basic' });
            const data = await fetchRoomByCreatedBy(user.emailAddresses[0].emailAddress);
            
            if (data && data.status === 'waiting') {
                router.push(`/select-country`);
            } else {
                const roomData = await insertRoom({
                    createdBy: user?.emailAddresses[0].emailAddress ?? '',
                    totalPlayers: maxPlayers,
                    totalQuestions: maxQuestions,
                    timer: timer,
                    orderId: '',
                });

                if (roomData) {
                    const roomId = roomData._id.toString();

                    // Store game settings with proper typing
                    await setData('gameSettings', {
                        roomId,
                        maxPlayers,
                        maxQuestions,
                        timer
                    });
                    
                    router.push(`/select-country`);
                }
            }
        } catch (error) {
            console.error('Error in handlePlanClick:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to initialize game settings",
            });
        } finally {
            setLoading(false);
        }
    } else {
        try {
            const response = await fetch("/api/payment-gateway/midtrans", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: price,
                    planName: planName,
                    userName: user.firstName + " " + user.lastName,
                    userEmail: user.emailAddresses[0].emailAddress,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const requestData = await response.json();
            window.snap.pay(requestData.token);
            window.snap.onSuccess = function(result: MidtransResult) {
                console.log('Transaction success:', result);
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Payment initialization failed",
            });
        } finally {
            setLoading(false);
        }
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
    
    // Render Midtrans Snap pop-up
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"
    const clientKey = process.env.NEXT_PUBLIC_CLIENT!
    const script = document.createElement("script")

    script.src = snapScript
    script.setAttribute("data-client-key", clientKey)
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-2">Choose Plan</h2>
      <p className="text-center text-muted-foreground mb-6">Pay per Quiz</p>
      {loading && <p className="text-center">Loading...</p>}
      <div className="space-y-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg",
              selectedPlan === plan.name ? "ring-2 ring-primary" : ""
            )}
            onClick={() => handlePlanClick(plan.name, plan.price, plan.maxPlayers, plan.maxQuestions, plan.timer)}
          >
            <CardHeader className="bg-muted p-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-1/3 p-4 flex items-center justify-center border-r">
                  <span className="text-2xl font-bold">{plan.priceText}</span>
                </div>
                <div className="w-2/3 p-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
