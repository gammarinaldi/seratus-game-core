"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { fetchRoomByCreatedBy } from '@/app/actions/Room'
import type { Question } from '@/app/types/quiz';
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from "./ui/toast"
import { useRouter } from 'next/navigation'

// Define types for stored data
interface StoredData {
    roomCode: string;
    gameState?: {
        currentQuestion: number;
        score: number;
    };
}

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

const setData = async (key: keyof StoredData, value: StoredData[keyof StoredData]) => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

const getData = async (key: keyof StoredData): Promise<StoredData[keyof StoredData]> => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

export default function Quiz() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [timer, setTimer] = useState(10) // Initial timer value
    const [showAnswer, setShowAnswer] = useState(false)
    const [buzzed, setBuzzed] = useState(false)
    const [buzzer, setBuzzer] = useState('')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const socketRef = useRef<Socket | null>(null)
    const { user } = useUser()
    const { toast } = useToast()
    const router = useRouter()

    // Handles Socket.IO connection and message handling
    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }
        
        const connectSocket = async () => {
            socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');

            socketRef.current.on('connect', async () => {
                console.log('Socket.IO connected in Quiz');
                try {
                    const roomCode = await getData('roomCode');
                    if (roomCode) {
                        socketRef.current?.emit('join', {
                            roomCode,
                            player: 'Host'
                        });
                    }
                } catch (error) {
                    console.error('Error getting room code:', error);
                }
            });

            socketRef.current.on('buzzed', (data) => {
                setBuzzer(data.player);
                setBuzzed(true);
                setTimer(10);
            });

            socketRef.current.on('questionStart', () => {
                resetQuestion();
            });
        }

        connectSocket();

        return () => {
            socketRef.current?.disconnect();
        }
    }, []);

    useEffect(() => {
        if (user?.emailAddresses[0].emailAddress) {
            fetchRoomByCreatedBy(user.emailAddresses[0].emailAddress).then(async (data) => {
                const roomCode = data.roomCode;
                await setData('roomCode', roomCode);

                try {
                    const parsedQuestions = JSON.parse(data.questions);
                    setQuestions(parsedQuestions);
                    setCurrentQuestion(parsedQuestions[currentQuestionIndex]);
                    setTimer(data.timer);
                    resetQuestion();
                    
                    // Send startQuestion message
                    if (socketRef.current) {
                        socketRef.current.emit('startQuestion', {
                            roomCode: roomCode
                        });
                    }
                } catch (error) {
                    console.error('Error processing questions:', error);
                    console.error('Questions data causing error:', data.questions);
                }
            }).catch(error => {
                console.error('Error fetching room:', error);
            });
        }
    }, [currentQuestionIndex, user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (buzzed && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } else if (timer === 0) {
            // Reset state when timer reaches 0
            setBuzzed(false);
            setBuzzer('');
            setTimer(10); // Reset timer to initial value
        }
        return () => clearInterval(interval);
    }, [buzzed, timer]);

    const resetQuestion = () => {
        setShowAnswer(false);
        setBuzzed(false);
        setBuzzer('');
        setTimer(10); // Reset timer to initial value
    };

    const handleRevealAnswer = () => {
        setShowAnswer(true)
    };

    const handleNextQuestion = () => {
        // First, show confirmation dialog for the last answer        
        if (buzzer) {
            const isCorrect = confirm(`Was ${buzzer}'s answer correct?`);
            
            if (isCorrect) {
                // Update score in IndexedDB
                const request = indexedDB.open('quiz', 1);
                
                request.onerror = (event) => {
                    console.error('IndexedDB error:', event);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to update score. Please try again.",
                        action: <ToastAction altText="Understood">Understood</ToastAction>
                    });
                };

                request.onsuccess = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    const transaction = db.transaction(['players'], 'readwrite');
                    const store = transaction.objectStore('players');

                    // Get current player data
                    const getRequest = store.get(buzzer);

                    getRequest.onsuccess = () => {
                        const playerData = getRequest.result;
                        // Update score (+10 points)
                        store.put({
                            name: buzzer,
                            score: (playerData?.score || 0) + 10
                        });
                    };
                };
            }
        }

        // Check if this was the last question
        if (currentQuestionIndex === questions.length - 1) {
            toast({
                title: "Game Over!",
                description: "Redirecting to leaderboard...",
            });
            router.push('/leaderboard');
            return;
        }

        // Continue with next question logic
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    };

    if (!currentQuestion) {
        return <div>Loading...</div>
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-center">Question {currentQuestionIndex + 1}/{questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center font-semibold">{currentQuestion.topic}</div>
                <div className="bg-yellow-100 p-4 rounded-md text-center">
                    {currentQuestion.question}
                </div>
                {/* <div className="space-y-2">
                    {renderAnswerButton(currentQuestion.correct_answer, true)}
                    {renderAnswerButton(currentQuestion.incorrect_answer, false)}
                </div> */}

                {   !showAnswer ? (
                    <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                        onClick={handleRevealAnswer}
                    >
                        Reveal Answer
                    </Button>
                ) : showAnswer ? (
                    <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                        onClick={handleNextQuestion}
                    >
                        Next Question
                    </Button>
                ) : null}
                
                <div className="bg-red-100 p-2 rounded-md flex justify-between items-center">
                    {buzzed ? (
                        <>
                            <span className="font-bold">{buzzer} buzzed in!</span>
                            <span>{timer}</span>
                        </>
                    ) : (
                        <span>Waiting for buzz...</span>
                    )}
                </div>
                
                {showAnswer && (
                    <div className="text-center font-semibold text-green-600">
                        The correct answer is: <br />
                        <div className="bg-green-100 p-2 rounded-md text-lg">{currentQuestion.correct_answer}</div> 
                    </div>

                )}
            </CardContent>
        </Card>
    )
}