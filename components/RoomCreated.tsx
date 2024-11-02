"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { fetchUserByClerkId } from "@/app/actions/User"
import { Buzzer } from "@/components/Buzzer"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export default function RoomCreated({ params }: { params: { roomCode: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get room code from room/:id
  const roomCode = params.roomCode

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
    
    // Check user role
    if (user?.id) {
      fetchUserByClerkId(user.id).then((userData) => {
        setUserRole(userData?.role || null);
      });
    }
  }, [user]);

  if (!roomCode || !user) return null;
  if (userRole === 'player') return <Buzzer />;

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">Room Created!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-center">Room Code</h2>
          <div className="text-2xl font-bold text-center">
            {roomCode.match(/.{1,3}/g)?.join(' ') || roomCode}
          </div>
        </div>
        <p className="text-sm text-center text-muted-foreground">Give the code to your players.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push('/lobby')}>
          Go to Lobby
        </Button>
      </CardFooter>
    </Card>
  )
}
