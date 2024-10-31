"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { QuizSettings, GameSettings } from '@/app/types/quiz';
import { useUser } from "@clerk/nextjs"

const TOPICS = [
  "Movie", "History", "Art", "Logic", "Science",
  "Sport", "Politic", "Geography", "Food", "Music"
]

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

// Define all possible stored data types
interface StoredData {
    quizSettings: QuizSettings;
    gameSettings: GameSettings;
    quizTopics: string[];
}

const setData = async <K extends keyof StoredData>(key: K, value: StoredData[K]) => {
    const db = await initDB() as IDBDatabase;
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

const getData = async <K extends keyof StoredData>(key: K): Promise<StoredData[K] | undefined> => {
    const db = await initDB() as IDBDatabase;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as StoredData[K]);
    });
};

export function SelectTopics() {
  const router = useRouter()
  const [topics, setTopics] = useState<string[]>([])
  const { toast } = useToast()
  const { user } = useUser()

  // Check for existing settings on component mount
  useEffect(() => {
    const checkSettings = async () => {
      try {
        const quizSettings = await getData('quizSettings');
        if (!quizSettings?.country || !quizSettings?.language) {
          router.push('/select-country');
        }
      } catch (error) {
        console.error('Error checking settings:', error);
        router.push('/select-country');
      }
    };

    checkSettings();
  }, [router]);

  const toggleTopic = async (topic: string) => {
    try {
      const newTopics = topics.includes(topic) 
        ? topics.filter(t => t !== topic) 
        : [...topics, topic];
      
      setTopics(newTopics);
      
      // Save topics to IndexedDB
      await setData('quizTopics', newTopics);
    } catch (error) {
      console.error('Error saving topics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save topics. Please try again.",
      });
    }
  }

  const handleNext = async () => {
    if (topics.length > 0) {
      try {
        // Verify all required data is present with proper types
        const quizSettings = await getData('quizSettings');
        const gameSettings = await getData('gameSettings');

        if (!quizSettings || !gameSettings) {
          throw new Error('Missing required settings');
        }

        router.push('/create-room');
      } catch (error) {
        console.error('Error proceeding to next step:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Some settings are missing. Please start over.",
        });
        router.push('/select-country');
      }
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Let&apos;s Select Topics
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          You can choose more than 1 topic
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {TOPICS.map((topic) => (
            <Button
              key={topic}
              variant={topics.includes(topic) ? "default" : "outline"}
              className="w-full h-12 text-lg font-medium"
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
        <Button
          onClick={handleNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          disabled={topics.length === 0}
        >
          Next
        </Button>
      </CardContent>
    </Card>
  )
}