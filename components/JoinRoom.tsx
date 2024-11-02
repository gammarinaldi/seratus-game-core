"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRoomByCode } from '@/app/actions/Room'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from './ui/toast'
import { io, Socket } from 'socket.io-client'
import { setData, getData } from '@/lib/indexeddb'

export function JoinRoom() {
    const [roomCode, setRoomCode] = useState('')
    const { user } = useUser()
    const router = useRouter()
    const socketRef = useRef<Socket | null>(null)
    const { toast } = useToast()
    const [roomJoined, setRoomJoined] = useState(false)

    const connectSocket = useCallback(() => {
        console.log('Connecting to socket in JoinRoom...');
        socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');

        socketRef.current.on('connect', () => {
            console.log('Socket.IO connected in JoinRoom');
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket.IO connection error in JoinRoom:', error);
        });

        socketRef.current.on('gameStart', async (data) => {
            console.log('Received gameStart event:', data);
            const storedRoomCode = await getData('roomCode');
            if (data.roomCode === storedRoomCode) {
                router.push('/buzzer');
            }
        });
    }, [router]);

    useEffect(() => {
        if (!user) {
            router.push('/');
        }

        connectSocket();

        return () => {
            socketRef.current?.disconnect();
        };
    }, [connectSocket, user, router]);

    const handleJoin = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                description: "Please login to continue.",
                duration: 5000,
                action: <ToastAction altText="Understood">Understood</ToastAction>
            });
            return;
        }
        
        const cleanedRoomCode = roomCode.replace(/\s+/g, '')
        const userId = user?.id
        const userEmail = user?.emailAddresses[0].emailAddress
        const userName = user?.fullName || 'Anonymous'

        try {
            const roomDetails = await fetchRoomByCode(cleanedRoomCode);
            
            if (!roomDetails) {
                toast({
                    variant: 'destructive',
                    description: "Room not found.",
                    duration: 5000,
                    action: <ToastAction altText="Close">Close</ToastAction>
                });
                return;
            }

            const players = roomDetails.players || [];

            if (players.includes(userEmail)) {
                toast({
                    variant: 'destructive',
                    description: "You've already joined this room.",
                    duration: 5000,
                    action: <ToastAction altText="Close">Close</ToastAction>
                });
                return;
            }

            if (socketRef.current?.connected) {
                socketRef.current.emit('join', { 
                    roomCode: cleanedRoomCode,
                    player: {
                        id: userId,
                        email: userEmail,
                        name: userName,
                    }
                });

                console.log('Join message sent successfully');
                setRoomCode('');
                setRoomJoined(true);
                
                await setData('roomCode', cleanedRoomCode);
                
            } else {
                console.error('Socket is not connected. Message not sent.');
                toast({
                    variant: 'destructive',
                    description: "Failed to connect to the game server. Please try again.",
                    duration: 5000,
                    action: <ToastAction altText="Close">Close</ToastAction>
                });
            }
        } catch (error) {
            console.error('Error joining room:', error);
            toast({
                variant: 'destructive',
                description: "An error occurred while joining the room.",
                duration: 5000,
                action: <ToastAction altText="Close">Close</ToastAction>
            });
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    {roomJoined ? "Room Joined!" : "Join Room"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {roomJoined ? (
                    <p className="text-center text-lg font-medium">Please wait until Host started the game.</p>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="roomCode" className="text-sm font-medium text-gray-700">
                                Input Room Code
                            </label>
                            <Input
                                id="roomCode"
                                type="text"
                                placeholder="546789"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                autoFocus
                            />
                        </div>
                        <Button
                            onClick={handleJoin}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={!roomCode}
                        >
                            Join
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
