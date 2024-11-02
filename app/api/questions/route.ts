import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import removeMd from 'remove-markdown';
import { Question } from '@/app/types/quiz';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { totalQuestions } = await request.json();

    // Validate input
    if (!totalQuestions || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return NextResponse.json({ error: 'Invalid totalQuestions' }, { status: 400 });
    }

    // Generate questions using Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });
    const prompt = `Buatkan total ${totalQuestions} soal dengan berbagai topik, yaitu penalaran umum, pengetahuan umum, dan pengetahuan kuantitatif . 
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
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions in generate-questions API:', error);
    return NextResponse.json({ error: 'Failed to generate questions', details: error }, { status: 500 });
  }
}
