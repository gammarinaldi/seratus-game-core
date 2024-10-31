"use client";

import { QuizProvider } from '@/contexts/QuizContext';

export function ClientQuizProvider({ children }: { children: React.ReactNode }) {
  return <QuizProvider>{children}</QuizProvider>;
}