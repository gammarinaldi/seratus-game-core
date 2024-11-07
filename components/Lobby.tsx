'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { useToast } from "@/hooks/use-toast"
import { getQuizData, setData } from '@/lib/indexeddb';
import { GameSettings, Player, SocketPlayer, UpdateEvent } from "@/app/types/quiz"

export default function Lobby() {
  const [players, setPlayers] = useState<Player[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [roomCode, setRoomCode] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!user) router.push('/');
    if (user && isLoaded) {
      console.log("User loaded");

      // Get room ID from IndexedDB
      getQuizData<GameSettings>('gameSettings').then(async (gameSettings) => {
        if (!gameSettings?.roomId) return;  

        setTotalPlayers(gameSettings.maxPlayers)
        setRoomCode(gameSettings.roomCode) 
      }).catch(error => {
        console.error('Error getting room ID:', error);
      });
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const connectSocket = () => {
      console.log('Connecting to socket in Lobby...');
      socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');

      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected in Lobby');
        if (socketRef.current?.connected && roomCode) {
          socketRef.current.emit('join', {
            roomCode: roomCode,
            player: {
              id: 'host',
              name: 'host',
              email: 'host'
            }
          });
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error in Lobby:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.error('Socket.IO connection closed in Lobby:', reason);
      });

      socketRef.current.on('update', ({ roomCode: messageRoomCode, players: newPlayers }: UpdateEvent) => {
        console.log('Received update in Lobby:', { messageRoomCode, newPlayers });
        if (messageRoomCode === roomCode) {
          // Filter out host and any invalid entries
          const uniquePlayers = newPlayers.filter((p: SocketPlayer) => 
              p && p.id && p.id !== 'host' && p.name
          );

          console.log('Processed players:', uniquePlayers);
          setPlayers(uniquePlayers as Player[]);
        }
      });
    };

    if (!user) router.push('/');
    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomCode, user, router]);

  const handleStartGame = async () => {
    console.log('Starting the game...');
    setShowConfirmation(false);
    
    try {
      // Store player data in IndexedDB with new structure
      const playerData = players.map(player => ({
        name: player.name,
        id: player.id,
        email: player.email,
        score: 0,
        timestamp: new Date().getTime()
      }));

      await setData('players', playerData);

      if (socketRef.current?.connected) {
        socketRef.current.emit('gameStart', {
          roomCode: roomCode
        });

        router.push(`/quiz?roomCode=${roomCode}`);
      } else {
        console.error('Socket is not connected. Cannot start the game.');
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to the game server. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error storing player data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize game data. Please try again.",
      });
    }
  };

  // Add this function to check if the start button should be disabled
  const isStartButtonDisabled = () => {
    return players.length === 0;
  };

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
            <h2 className="text-sm font-medium text-center">Pemain</h2>
            <div className="text-2xl font-bold text-center">
              {players.length}/{totalPlayers}
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {players.length === 0 
              ? "Menunggu pemain untuk bergabung..." 
              : "Siap untuk memulai game!"}
          </p>
          <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            <ul className="list-none space-y-1">
              {players.map((player: Player) => (
                <li 
                  key={player.id}
                  className="text-sm text-center"
                >
                  {player.name}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => setShowConfirmation(true)}
            disabled={isStartButtonDisabled()}
          >
            {isStartButtonDisabled() ? 'Menunggu pemain...' : 'Mulai Game'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="w-full max-w-xs mx-auto mt-4 rounded-lg">
          <DialogHeader>
            <DialogTitle>Mulai Game</DialogTitle>
          </DialogHeader>
          <p>Apakah kamu yakin ingin memulai game dengan {players.length} pemain?</p>
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
