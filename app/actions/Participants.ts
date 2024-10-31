import { getBaseUrl } from "@/lib/utils";

export const updatePlayers = async (roomId: string, players: string[]) => {
    try {
        const response = await fetch(`${getBaseUrl()}/api/players`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomId, players }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update players');
        }
  
        const data = await response.json();
        return data
      } catch (error) {
        console.error('Error updating players:', error);
      }
  }