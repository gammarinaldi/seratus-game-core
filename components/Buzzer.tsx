'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from './ui/toast'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { getData } from '@/lib/indexeddb'

export function Buzzer() {
  const [isBuzzed, setIsBuzzed] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  const connectSocket = useCallback(() => {
    if (!user) return;

    console.log('Connecting to socket in Buzzer...');
    socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current.on('connect', async () => {
      console.log('Socket.IO connected in Buzzer');
      try {
        const roomCode = await getData('roomCode');
        if (roomCode) {
          socketRef.current?.emit('join', {
            roomCode,
            player: user.fullName || 'Anonymous'
          });
        }
      } catch (error) {
        console.error('Error getting room code:', error);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        variant: 'destructive',
        title: "Connection Error",
        description: "Failed to connect to game server. Retrying...",
        duration: 3000,
        action: <ToastAction altText="Understood">Understood</ToastAction>
      });
    });

    socketRef.current.on('disconnect', (reason) => {
      setIsDisabled(true);
    });

    socketRef.current.on('questionStart', () => {
      setIsDisabled(false);
      setIsBuzzed(false);
    });

    socketRef.current.on('buzzed', () => {
      setIsDisabled(true);
    });

  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }

    if (isLoaded && user) {
      connectSocket();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isLoaded, user, connectSocket]);

  const handleBuzz = async () => {
    try {
      const roomCode = await getData('roomCode');
      if (!roomCode) {
        throw new Error('No room code found');
      }

      if (!socketRef.current?.connected) {
        throw new Error('Not connected to server');
      }

      socketRef.current.emit('buzz', {
        roomCode,
        player: user?.fullName || 'Anonymous'
      });

      setIsBuzzed(true);
      setIsDisabled(true);
      
    } catch (error) {
      console.error('Buzz error:', error);
      toast({
        variant: 'destructive',
        title: "Connection Error",
        description: "Failed to send buzz. Please check your connection and try again.",
        duration: 3000,
        action: <ToastAction altText="Understood">Understood</ToastAction>
      });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-64 h-96 bg-white p-4 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Be the first to answer!</h2>
      <Button
        className={`w-64 h-64 rounded-full text-4xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
          isBuzzed
            ? 'bg-green-600 hover:bg-green-700 shadow-green-800/50'
            : 'bg-red-500 hover:bg-red-600 shadow-red-600/50'
        } ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
        }`}
        onClick={handleBuzz}
        disabled={isDisabled}
        style={{
          boxShadow: `0 6px 0 ${isBuzzed ? '#16a34a' : '#dc2626'}`,
          transform: 'translateY(-1px)',
        }}
      >
        {isBuzzed ? 'BUZZED!' : 'BUZZ!'}
      </Button>
    </div>
  )
}
