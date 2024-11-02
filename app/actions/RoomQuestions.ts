import { getBaseUrl } from "@/lib/utils";

export const updateRoomQuestions = async (totalQuestions: number, roomId: string) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ totalQuestions }),
        });

        if (!response.ok) {
            console.error('Generate questions failed with status:', response.status);
            throw new Error('Failed to generate questions');
        }

        const questions = await response.json();

        try {
            const response = await fetch(`${getBaseUrl()}/api/room-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions, roomId }),
            });
    
            if (!response.ok) {
                console.error('Update room questions failed with status:', response.status);
                throw new Error('Failed to update room questions');
            }
    
            const data = await response.json();
            return data
        } catch (error) {
            console.error('Error updating room questions:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error generating questions:', error);
        throw error;
    }
}