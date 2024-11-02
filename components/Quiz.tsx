"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { fetchRoomByCode } from '@/app/actions/Room'
import type { Question } from '@/app/types/quiz';
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from "./ui/toast"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getQuizData, setData } from '@/lib/indexeddb'
import type { Player } from '@/app/types/quiz'
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, XCircle } from 'lucide-react'

export default function Quiz() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [buzzed, setBuzzed] = useState(false)
    const [buzzer, setBuzzer] = useState('')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [showRevealDialog, setShowRevealDialog] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showCorrectPopup, setShowCorrectPopup] = useState(false)
    const [showIncorrectPopup, setShowIncorrectPopup] = useState(false)

    const socketRef = useRef<Socket | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('roomCode') || '';
    const { user, isLoaded } = useUser()
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            console.log("User not found");
            router.push('/');
            return;
        }

        if (user && isLoaded) {
            fetchRoomByCode(roomCode).then(async (data) => {
                const roomCode = data.roomCode;
                try {
                    const questions = data.questions;
                    setQuestions(questions);
                    setCurrentQuestion(questions[currentQuestionIndex]);
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
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to load questions. Please try again.",
                    });
                }
            }).catch(error => {
                console.error('Error fetching room:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch room data. Please try again.",
                });
            });
        }
    }, [isLoaded, user, router, roomCode, currentQuestionIndex, toast]);

    useEffect(() => {
        const connectSocket = async () => {
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

            socketRef.current.on('buzzed', (data) => {
                setBuzzer(data.player);
                setBuzzed(true);
            });

            socketRef.current.on('questionStart', () => {
                resetQuestion();
            });
        }

        if (!user) router.push('/');
        connectSocket();

        return () => {
        socketRef.current?.disconnect();
        };
    }, [roomCode, user, router]);

    const resetQuestion = () => {
        setShowAnswer(false);
        setBuzzed(false);
        setBuzzer('');
    };

    const confirmRevealAnswer = () => {
        setShowAnswer(true);
        setShowRevealDialog(false);
    };

    const proceedToNextQuestion = (isCorrect: boolean) => {
        if (isCorrect) {
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
                console.log('Successfully updated score in IndexedDB:', event);

                getQuizData<Player[]>('players').then(async (players) => {
                    if (!players) return;  

                    // Get current player data
                    const player = players.find(player => player.name === buzzer);

                    if (player) {
                        // Update score (+10 points)
                        player.score += 10;
                        setData('players', players);
                    };
                }).catch(error => {
                    console.error('Error getting room ID:', error);
                });
            };
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

        if (isCorrect) {
            setShowCorrectPopup(true);
        } else {
            setShowIncorrectPopup(true);
        }

        setTimeout(() => {
            setShowCorrectPopup(false);
            setShowIncorrectPopup(false);

            // Update both the index and the current question
            setCurrentQuestionIndex(prevIndex => {
                const newIndex = prevIndex + 1;
                setCurrentQuestion(questions[newIndex]);
                return newIndex;
            });
            
            // Reset the question state
            resetQuestion();

            // Emit the start question event for the next question
            if (socketRef.current) {
                socketRef.current.emit('startQuestion', {
                    roomCode: roomCode
                });
            }
        }, 5000);
    };

    const handleOptionClick = (option: string, letter: string) => {
        if (!showAnswer) {  // Only allow selection if answer isn't revealed
            setSelectedAnswer(option);
            setShowAnswer(true);

            const isCorrectAnswer = letter === currentQuestion?.correctAnswer;
            if (isCorrectAnswer) {
                proceedToNextQuestion(true);
            } else {
                proceedToNextQuestion(false);
            }
        }
    };

    if (!currentQuestion) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-center">
                        Question {currentQuestionIndex + 1}/{questions.length}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center font-semibold">{currentQuestion.topic}</div>
                    <div className="bg-yellow-100 p-4 rounded-md text-center">
                        {currentQuestion.question}
                    </div>
                    
                    {/* Updated options display for new structure */}
                    <div className="flex flex-col space-y-2">
                        {Object.entries(currentQuestion.choices).map(([letter, option]) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = letter === currentQuestion.correctAnswer;
                            
                            let optionStyle = 'bg-gray-100';
                            if (showAnswer) {
                                if (isSelected) {
                                    optionStyle = isCorrectAnswer 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800';
                                } else if (isCorrectAnswer) {
                                    optionStyle = 'bg-green-100 text-green-800';
                                }
                            }

                            return (
                                <div 
                                    key={letter}
                                    className={`p-3 rounded-md transition-colors cursor-pointer focus:bg-transparent ${optionStyle} ${showAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => handleOptionClick(option, letter)}
                                >
                                    <span className="font-semibold">{letter}.</span> {option}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className={`${buzzed ? 'bg-green-600 text-white' : 'bg-red-500 text-white'} p-4 rounded-md text-center`}>
                        {buzzed ? (
                            <span className="font-bold">{buzzer} buzzed in!</span>
                        ) : (
                            <span>Waiting for buzz...</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showRevealDialog} onOpenChange={setShowRevealDialog}>
                <DialogContent className="max-w-xs rounded-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Reveal Answer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reveal the answer? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRevealDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmRevealAnswer}
                        >
                            Reveal Answer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {showCorrectPopup && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute"
                >
                    <Card className="bg-white/100 border-2 border-green-500 shadow-lg">
                    <CardContent className="p-6 flex flex-col items-center">
                        <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        >
                        <Sparkles className="w-12 h-12 text-yellow-400 mb-2" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-green-600 mb-2">Correct!</h2>
                        <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold text-indigo-600">+10</span>
                        <span className="text-2xl font-semibold text-indigo-400 ml-1">points</span>
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showIncorrectPopup && (
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute"
                >
                    <Card className="bg-white border-2 border-red-500 shadow-lg">
                    <CardContent className="p-6 flex flex-col items-center">
                        <motion.div
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                        <XCircle className="w-12 h-12 text-red-500 mb-2" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-red-600 mb-2">Incorrect</h2>
                        <div className="flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-700">Try Again!</span>
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}