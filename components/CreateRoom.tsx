"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchRoomById, updateRoomDetails } from "@/app/actions/Room"
import type { QuizSettings, GameSettings } from '@/app/types/quiz';
import { useUser } from "@clerk/nextjs"

// Add IndexedDB utility functions
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

const getData = async <T,>(key: string): Promise<T> => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as T);
    });
};

export default function CreateRoom() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [maxPlayers, setMaxPlayers] = useState(0)
    const [maxQuestions, setMaxQuestions] = useState(0)
    const [timer, setTimer] = useState(0)
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState('')
    const [topics, setTopics] = useState<string[]>([])
    const [roomId, setRoomId] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            router.push('/');
        }

        const loadData = async () => {
            try {
                const gameSettings = await getData<GameSettings>('gameSettings');
                if (!gameSettings?.roomId) return;

                // Get room details from database
                const data = await fetchRoomById(gameSettings.roomId);
                if (data.orderId.startsWith("pro")) {
                    setMaxPlayers(10)
                    setMaxQuestions(2)
                } else if (data.orderId.startsWith("premium")) {
                    setMaxPlayers(50)
                    setMaxQuestions(3)
                } else {
                    setMaxPlayers(6)
                    setMaxQuestions(1)
                }

                // Get other settings from IndexedDB
                const quizSettings = await getData<QuizSettings>('quizSettings');
                const quizTopics = await getData<string[]>('quizTopics');

                // Set local state
                setRoomId(gameSettings.roomId)
                setRoomCode(data.roomCode)
                setTimer(data.timePerQuestion)
                setCountry(quizSettings?.country ?? '')
                setLanguage(quizSettings?.language ?? '')
                setTopics(quizTopics ?? [])
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [])

    const handleCreateRoom = async () => {
        setIsLoading(true);      

        try {
            // Construct room details
            const roomDetails = {
                roomId: roomId,
                totalPlayers: maxPlayers,
                totalQuestions: maxQuestions,
                timePerQuestion: timer,
                topics: topics,
                country: country,
                language: language,
                userEmail: user?.emailAddresses[0].emailAddress
            }

            // Update room details in database
            const data = await updateRoomDetails(roomDetails);
            console.log("Room details updated:", data)
            router.push(`/room/${roomCode}`);
        } catch (error) {
            console.error('Error creating room:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Confirm Quiz Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-md font-medium flex items-center">
                        <span className="font-bold text-primary flex items-center text-md">
                            <Check className="mr-2 h-6 w-6" /> 
                            Up to {maxPlayers} players
                        </span>
                    </p>
                    <p className="text-sm font-medium flex items-center">
                        <span className="font-bold text-primary flex items-center text-md">
                            <Check className="mr-2 h-6 w-6" /> 
                            Up to {maxQuestions} questions per topic
                        </span>
                    </p>
                </div>
                <div>
                    <p className="text-sm font-medium mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic, index) => (
                            <Badge key={index} variant="secondary">{topic}</Badge>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Country: <span className="font-bold text-primary">{country}</span></p>
                    <p className="text-sm font-medium">Language: <span className="font-bold text-primary">{language}</span></p>
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
