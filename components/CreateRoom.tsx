"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchRoomById } from "@/app/actions/Room"
import type { GameSettings } from '@/app/types/quiz';
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "./ui/toast"
import { getQuizData } from '@/lib/indexeddb'
import { updateRoomQuestions } from "@/app/actions/RoomQuestions"

export default function CreateRoom() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [maxPlayers, setMaxPlayers] = useState(0)
    const [maxQuestions, setMaxQuestions] = useState(0)
    const [roomCode, setRoomCode] = useState('')
    const [roomId, setRoomId] = useState('')
    const { user } = useUser();
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            router.push('/');
        }

        const loadData = async () => {
            try {
                const gameSettings = await getQuizData<GameSettings>('gameSettings');
                const roomId = gameSettings?.roomId;
                if (!roomId) {
                    toast({
                        variant: 'destructive',
                        title: "Oops!",
                        description: "Something went wrong. Please try again.",
                        duration: 3000,
                        action: <ToastAction altText="Okay">Okay</ToastAction>,
                    });
                    return;
                }
                setRoomId(roomId)

                try {
                    const room = await fetchRoomById(roomId);
                    setMaxPlayers(room?.totalPlayers)
                    setMaxQuestions(room?.totalQuestions)
                    setRoomCode(room?.roomCode)
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [user, router, toast])

    const handleCreateRoom = async () => {
        setIsLoading(true);      
        try {
            const data = await updateRoomQuestions(maxQuestions, roomId);
            console.log("Room questions updated:", data)
            router.push(`/room/${roomCode}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast({
                variant: 'destructive',
                title: "Oops!",
                description: "Something went wrong. Please try again.",
                duration: 3000,
                action: <ToastAction altText="Okay" onClick={handleCreateRoom}>Okay</ToastAction>
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Confirm Quiz Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-md font-medium flex items-center">
                        <span className="flex">
                            <Check className="mr-2 h-5 w-5" /> 
                            Up to {maxPlayers} players
                        </span>
                    </p>
                    <p className="text-md font-medium flex items-center">
                        <span className="flex">
                            <Check className="mr-2 h-5 w-5" /> 
                            Up to {maxQuestions} questions per topic
                        </span>
                    </p>
                </div>
                <div>
                    <p className="text-md font-medium mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Penalaran Umum</Badge>
                        <Badge variant="secondary">Pengetahuan Umum</Badge>
                        <Badge variant="secondary">Pengetahuan Kuantitatif</Badge>
                    </div>
                </div>
            </CardContent>
            <CardContent className="space-y-4">
                <Button
                    onClick={handleCreateRoom}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={maxPlayers === 0 || maxQuestions === 0 || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            AI is creating your quiz...
                        </>
                    ) : (
                        'Create Room'
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
