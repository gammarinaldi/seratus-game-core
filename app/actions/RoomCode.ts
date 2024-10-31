export const fetchRoomCode = async () => {
    try {
      const response = await fetch('/api/get-room-code', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room details')
      }

      const data = await response.json()
      return data.code
    } catch (error) {
      console.error('Error fetching room details:', error)
    }
  }