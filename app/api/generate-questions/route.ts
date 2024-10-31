import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import removeMd from 'remove-markdown';
import { sendQuestionsToEmail } from '@/app/actions/sendEmail';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { topics, country, language, totalQuestions, userEmail } = await request.json();

    // Validate input
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Invalid topics' }, { status: 400 });
    }
    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
    }
    if (!language || typeof language !== 'string') {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }
    if (!totalQuestions || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return NextResponse.json({ error: 'Invalid totalQuestions' }, { status: 400 });
    }
    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({ error: 'Invalid userEmail' }, { status: 400 });
    }

    // Generate questions using Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });
    const prompt = `With following topics: ${topics.join(', ')}.
    Create ${totalQuestions} questions per topic that are specific to ${country} culture with 1 correct answer. 
    Provide consistent format with topic, question, and 1 correct answer.
    Output language is in ${language}.
    Always format the response as array of objects.
    Remove triple backticks and any surrounding whitespace.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsedQuestions = removeMd(text).replace('`', '');

    // Send questions and answers to the user email
    sendQuestionsToEmail(userEmail, parsedQuestions);

    return NextResponse.json({ parsedQuestions });
  } catch (error) {
    console.error('Error generating questions in generate-questions API:', error);
    return NextResponse.json({ error: 'Failed to generate questions', details: error }, { status: 500 });
  }
}
