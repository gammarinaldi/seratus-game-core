import { fetchRoomCode } from "@/app/actions/RoomCode"
import { getBaseUrl } from "@/lib/utils"

interface RoomParams {
    orderId: string;
    createdBy: string;
    totalPlayers?: number;
    totalQuestions?: number;
    players?: Player[];
    timer?: number;
}

interface Player {
    id: string;
    name: string;
    score?: number;
}

export const insertRoom = async (params: RoomParams) => {
    const roomCode = await fetchRoomCode();
    try {
        const response = await fetch(`${getBaseUrl()}/api/room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...params, roomCode}),
        });

        if (!response.ok) {
            console.error('Room creation failed with status:', response.status);
            throw new Error('Error initializing room');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error initializing room:', error);
        throw error; // Re-throwing error for better error handling
    }
}

export const fetchRoomById = async (roomId: string) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/room?id=${encodeURIComponent(roomId)}`, {
            method: 'GET',
        })

        if (!response.ok) {
            console.error('Room fetch failed with status:', response.status);
            throw new Error('Failed to fetch room details')
        }

        const roomData = await response.json()
        return roomData
    } catch (error) {
        console.error('Error fetching room details:', error)
        throw error;
    }
}

export const fetchRoomByCode = async (roomCode: string) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/room?code=${encodeURIComponent(roomCode)}`, {
            method: 'GET',
        })

        if (!response.ok) {
            console.error('Room fetch failed with status:', response.status);
            throw new Error('Failed to fetch room details')
        }

        const roomData = await response.json()
        return roomData
    } catch (error) {
        console.error('Error fetching room details:', error)
        throw error;
    }
}

export const fetchRoomByCreatedBy = async (createdBy: string) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/room?createdBy=${encodeURIComponent(createdBy)}`, {
            method: 'GET',
        })

        if (!response.ok) {
            console.error('Room fetch failed with status:', response.status);
            throw new Error('Failed to fetch room details')
        }

        const roomData = await response.json()
        return roomData
    } catch (error) {
        console.error('Error fetching room details:', error)
        throw error;
    }
}

export const updateRoomDetails = async (roomDetails: Partial<RoomParams>) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/room`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomDetails }),
        });

        if (!response.ok) {
            console.error('Room update failed with status:', response.status);
            throw new Error('Failed to update room');
        }

        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error updating room:', error);
        throw error;
    }
}
