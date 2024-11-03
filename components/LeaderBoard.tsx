"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getQuizData } from '@/lib/indexeddb'
import { Crown } from "lucide-react"
import { updateRoomStatus } from '@/app/actions/Room';
import { GameSettings, Player } from '@/app/types/quiz';
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@radix-ui/react-toast'

export default function LeaderBoardComponent() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const gameSettings = await getQuizData<GameSettings>('gameSettings');
                const roomId = gameSettings?.roomId;
                if (!roomId) {
                    toast({
                        title: 'Something went wrong',
                        description: 'Please try again.',
                        duration: 3000,
                        variant: 'destructive',
                        action: <ToastAction altText="Okay">Okay</ToastAction>,
                    })
                    return;
                }

                const players = await getQuizData<Player[]>('players');
                if (!players) {
                    toast({
                        title: 'Something went wrong',
                        description: 'Please try again.',
                        duration: 3000,
                        variant: 'destructive',
                        action: <ToastAction altText="Okay">Okay</ToastAction>,
                    })
                    console.error('No players found');
                    return;
                }

                const sortedPlayers = players.sort((a, b) => b.score - a.score);
                setPlayers(sortedPlayers);

                const mappedPlayers = sortedPlayers.map((player, index) => ({
                    id: player.id,
                    name: player.name,
                    email: player.email,
                    score: player.score || 0,
                    rank: index + 1,
                    timestamp: player.timestamp || Date.now()
                }));

                await updateRoomStatus(roomId, 'done', mappedPlayers);
            } catch (error) {
                console.error('Error in fetchPlayers:', error);
            }
        };

        fetchPlayers();
    }, [toast]);

    return (
        <Card className="w-full max-w-xs mx-auto mt-10">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {players.map((player, index) => {
                        let rankStyle = '';
                        if (index === 0) {
                            rankStyle = 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'; // Gold
                        } else if (index === 1) {
                            rankStyle = 'bg-gray-100 text-gray-800 border-2 border-gray-400'; // Silver
                        } else if (index === 2) {
                            rankStyle = 'bg-orange-100 text-orange-800 border-2 border-orange-400'; // Bronze
                        } else {
                            rankStyle = 'bg-gray-100'; // Default style
                        }

                        return (
                            <div 
                                key={player.name}
                                className={`flex justify-between items-center p-6 rounded-lg ${rankStyle}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg relative">
                                        {index === 0 && (
                                            <Crown 
                                                className="absolute -top-5 -left-1 w-5 h-5 text-yellow-500" 
                                                fill="currentColor"
                                            />
                                        )}
                                        {index + 1}.
                                    </span>
                                    <span>{player.name}</span>
                                </div>
                                <span className="font-bold text-lg">
                                    {player.score} pts
                                </span>
                            </div>
                        );
                    })}
                    
                    {players.length === 0 && (
                        <div className="text-center text-gray-500">
                            No players found
                        </div>
                    )}

                    <Button 
                        className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => router.push('/')}
                    >
                        Create Another Quiz
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}