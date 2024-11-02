export interface GameSettings {
    roomId: string;
    roomCode: string;
    maxPlayers: number;
    maxQuestions: number;
    timer: number;
}

export interface Question {
    topic: string;
    question: string;
    choices: {
        [key: string]: string
    };
    correctAnswer: string;
}

export interface Player {
    name: string;
    id: string;
    email: string;
    score: number;
    timestamp: number;
}

export interface SocketPlayer {
    id: string;
    name: string;
    email: string;
    score?: number;
}

export interface UpdateEvent {
    roomCode: string;
    players: SocketPlayer[];
}

export interface RoomParams {
    roomId: string;
    createdBy: string;
    totalPlayers?: number;
    totalQuestions?: number;
    players?: Player[];
    timer?: number;
    status?: string;
}