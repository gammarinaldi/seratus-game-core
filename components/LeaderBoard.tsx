"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Player {
    name: string;
    score: number;
}

export default function LeaderBoard() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            const request = indexedDB.open('quiz', 1);

            request.onerror = (event) => {
                console.error('Error opening database:', event);
            };

            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = db.transaction(['players'], 'readonly');
                const store = transaction.objectStore('players');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    const players = getAllRequest.result;
                    // Sort players by score in descending order
                    const sortedPlayers = players.sort((a, b) => b.score - a.score);
                    setPlayers(sortedPlayers);
                };
            };
        };

        fetchPlayers();
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {players.map((player, index) => (
                        <div 
                            key={player.name}
                            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                        >
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">
                                    {index + 1}.
                                </span>
                                <span>{player.name}</span>
                            </div>
                            <span className="font-bold text-lg">
                                {player.score} pts
                            </span>
                        </div>
                    ))}
                    
                    {players.length === 0 && (
                        <div className="text-center text-gray-500">
                            No players found
                        </div>
                    )}

                    <Button 
                        className="w-full mt-6"
                        onClick={() => router.push('/')}
                    >
                        Create Another Quiz
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}