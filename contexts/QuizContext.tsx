"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

type QuizState = {
  maxPlayers: number;
  maxQuestions: number;
  timer: number;
  country: string;
  language: string;
  topics: string[];
  plan: string;
  price: number;
  userName: string;
  userEmail: string;
  roomId: string;
};

type QuizAction =
  | { type: 'SET_PARTICIPANTS'; payload: number }
  | { type: 'SET_QUESTIONS'; payload: number }
  | { type: 'SET_TIMER'; payload: number }
  | { type: 'SET_COUNTRY'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_TOPICS'; payload: string[] }
  | { type: 'SET_PLAN'; payload: string }
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_USER_EMAIL'; payload: string }
  | { type: 'SET_ROOM_ID'; payload: string }
  | { type: 'RESET' };

const initialState: QuizState = {
  maxPlayers: 0,
  maxQuestions: 0,
  timer: 5,
  country: '',
  language: '',
  topics: [],
  plan: '',
  price: 0,
  userName: '',
  userEmail: '',
  roomId: '',
};

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | undefined>(undefined);

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_PARTICIPANTS':
      return { ...state, maxPlayers: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, maxQuestions: action.payload };
    case 'SET_TIMER':
      return { ...state, timer: action.payload };
    case 'SET_COUNTRY':
      return { ...state, country: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    case 'SET_PLAN':
      return { ...state, plan: action.payload };
    case 'SET_PRICE':
      return { ...state, price: action.payload };
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };
    case 'SET_USER_EMAIL':
      return { ...state, userEmail: action.payload };
    case 'SET_ROOM_ID':
      return { ...state, roomId: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}