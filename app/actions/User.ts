export const fetchUserByClerkId = async (clerkId: string) => {
  try {
    const response = await fetch('/api/user?clerkId=' + clerkId, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user details')
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

// Define allowed update fields
interface UserUpdateData {
  role?: 'host' | 'player';
  plan?: 'basic' | 'pro' | 'premium';
}

export const updateUserField = async (userId: string, updateData: Partial<UserUpdateData>) => {
    try {        
        const response = await fetch('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, ...updateData }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[updateUserField] Error:', error);
        throw error;
    }
}
