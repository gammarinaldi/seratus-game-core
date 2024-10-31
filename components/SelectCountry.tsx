"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
const countries = [
  "Worldwide",
  "Indonesia",
]

const languages = [
  "English",
  "Indonesia",
] 

// Define interface for quiz settings
interface QuizSettings {
  country: string;
  language: string;
}

// Define all possible stored data types
interface StoredData {
  quizSettings: QuizSettings;
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

export function SelectCountry() {
  const router = useRouter()
  const [country, setCountry] = useState('')
  const [language, setLanguage] = useState('')
  const { toast } = useToast()
  const { user } = useUser()

  const handleNext = async () => {
    if (country && language) {
      try {
        // Store country and language settings
        await setData('quizSettings', {
          country,
          language
        });
        
        router.push('/select-topics')
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save settings. Please try again.",
        });
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
        <CardTitle className="text-2xl font-bold text-center">Select your country</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Your Quiz will be tailored based on your country
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={(value) => setCountry(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setLanguage(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          disabled={!country || !language}
        >
          Next
        </Button>
      </CardContent>
    </Card>
  )
}