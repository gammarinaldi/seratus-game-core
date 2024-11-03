'use server'

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Question } from "@/app/types/quiz";
import { GoogleGenerativeAI } from '@google/generative-ai';
import removeMd from 'remove-markdown';

export const updateRoomQuestions = async (totalQuestions: number, roomId: string) => {
    try {
        const questions = await generateQuestions(totalQuestions);

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const result = await db.collection('rooms').updateOne(
            { _id: ObjectId.createFromHexString(roomId) },
            { $set: { questions: questions } },
        )

        if (result.modifiedCount === 0) {
            console.error('Failed to update room questions - No documents modified');
            throw new Error('Failed to update room questions - No documents modified');
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating room questions:', error);
        throw error;
    }
}

export const generateQuestions = async (totalQuestions: number) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Validate input
    if (!totalQuestions || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      throw new Error('Invalid totalQuestions');
    }

    // Generate questions using Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });
    const prompt = `Buatkan total ${totalQuestions} soal dengan berbagai topik, yaitu penalaran umum, pemahaman umum, dan pengetahuan kuantitatif . 
    Berikan format yang konsisten seperti berikut:
    [
        {
            topic: string,
            question: string,
            choices: {
                [key: string]: string
            },
            correctAnswer: string
        }
    ]
        
    Contoh:
    [
        {
            topic: "Penalaran Umum",
            question: "Apa yang dimaksut dengan 'demokrasi'?",
            choices: {
                A: "Dari kata 'demos' yang berarti rakyat", 
                B: "Dari kata 'kratos' yang berarti rakyat", 
                C: "Dari kata 'kratos' yang berarti rakyat", 
                D: "Dari kata 'demos' yang berarti rakyat"
            },
            correctAnswer: "A"
        }
    ]
    Selalu format respons sebagai array objek.
    Hapus triple backtick dan spasi di sekitarnya.`;

    console.log("PROMPT", prompt);
    console.log("WAITING RESPONSE...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = removeMd(text).replace('`', '');
    console.log("AI RESPONSE", cleanText);
    
    // Parse the string into an array of Question objects
    const questions: Question[] = JSON.parse(cleanText);
    return questions;
  } catch (error) {
    console.error('Error generating questions in generate-questions API:', error);
    throw error;
  }
}