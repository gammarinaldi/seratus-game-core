import { fetchRoomCode } from "@/app/actions/RoomCode"
import { getBaseUrl } from "@/lib/utils"
import { RoomParams } from "@/app/types/quiz"

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
        console.log('Updating room with details:', roomDetails);

        const response = await fetch(`${getBaseUrl()}/api/room`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomDetails }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Room update failed:', errorData);
            throw new Error(`Failed to update room: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating room:', error);
        throw error;
    }
}
