'use client'

import { fetchRoomByCreatedBy } from "@/app/actions/Room"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "./ui/toast"

export default function Lobby() {
  const [players, setPlayers] = useState<string[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [roomCode, setRoomCode] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()
  const { user, isLoaded } = useUser()

  const handleStartGame = () => {
    console.log('Starting the game...');
    setShowConfirmation(false);
    
    // Save players with initial scores to IndexedDB
    const dbName = 'quiz';
    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize game data. Please try again.",
      });
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('players')) {
        db.createObjectStore('players', { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['players'], 'readwrite');
      const store = transaction.objectStore('players');

      // Clear existing players
      store.clear();

      // Add each player with initial score
      players.forEach(players => {
        store.add({ name: players, score: 0 });
      });

      // Continue with socket emission and navigation
      if (socketRef.current?.connected) {
        socketRef.current.emit('gameStart', {
          roomCode: roomCode
        });
        
        router.push('/quiz');
      } else {
        console.error('Socket is not connected. Cannot start the game.');
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to the game server. Please try again.",
        });
      }
    };
  }

  // Add this function to check if the start button should be disabled
  const isStartButtonDisabled = () => {
    return players.length === 0;
  };

  useEffect(() => {
    if (isLoaded && user?.emailAddresses[0].emailAddress) {
      fetchRoomByCreatedBy(user.emailAddresses[0].emailAddress).then((roomDetails) => {
        setTotalPlayers(roomDetails.totalPlayers)
        setRoomCode(roomDetails.roomCode)
        
        if (roomDetails.players) {
          const uniquePlayers = Array.from(new Set(roomDetails.players.filter((p: string) => p !== 'host')))
          setPlayers(uniquePlayers as string[])
        }
      })
    }
  }, [isLoaded,user])

  useEffect(() => {
    if (!user) {
      router.push('/');
    }

    const connectSocket = () => {
      console.log('Connecting to socket in Lobby...');
      socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');

      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected in Lobby');
        if (socketRef.current?.connected && roomCode) {
          socketRef.current.emit('join', {
            roomCode: roomCode,
            player: 'host'
          });
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error in Lobby:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.error('Socket.IO connection closed in Lobby:', reason);
      });

      socketRef.current.on('update', ({ roomCode: messageRoomCode, players: newPlayers }) => {
        console.log('Received update in Lobby:', { messageRoomCode, newPlayers });
        if (messageRoomCode === roomCode) {
          const uniquePlayers = Array.from(new Set(newPlayers.filter((p: string) => p !== 'host')))
          setPlayers(uniquePlayers as string[]);
        }
      });
    };

    if (roomCode) {
      connectSocket();
    } else {
      toast({
        variant: 'destructive',
        description: "Something went wrong. Please try again.",
        duration: 3000,
        action: <ToastAction altText="Understood">Understood</ToastAction>
      })
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomCode]);

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Card className="w-full max-w-xs mx-auto mt-4">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Lobby</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-center">Players</h2>
            <div className="text-2xl font-bold text-center">
              {players.length}/{totalPlayers}
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {players.length === 0 
              ? "Waiting for players to join..." 
              : "Ready to start the game!"}
          </p>
          <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            <ul className="list-none space-y-1">
              {players.map((name: string, index: number) => (
                <li key={index} className="text-sm text-center">{name}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowConfirmation(true)}
            disabled={isStartButtonDisabled()}
          >
            {isStartButtonDisabled() ? 'Waiting for Players...' : 'Start Game'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="w-full max-w-xs mx-auto mt-4 rounded-lg">
          <DialogHeader>
            <DialogTitle>Start Game</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to start the game with {players.length} players?</p>
          <DialogFooter>
            <Button variant="outline" className="mt-4" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button className="mt-4" onClick={handleStartGame}>
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
