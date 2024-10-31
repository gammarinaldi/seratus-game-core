export interface QuizSettings {
    country: string;
    language: string;
}
  
export interface GameSettings {
    roomId: string;
    maxPlayers: number;
    maxQuestions: number;
    timer: number;
}

export interface Question {
    topic: string;
    question: string;
    correct_answer: string;
    incorrect_answer: string;
  }