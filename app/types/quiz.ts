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
    createdBy: string;
    totalPlayers?: number;
    totalQuestions?: number;
    plan?: string;
    players?: Player[];
    timer?: number;
    status?: string;
    roomId?: string;
    orderId?: string;
}
