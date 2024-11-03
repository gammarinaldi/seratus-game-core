'use server'

import clientPromise from "@/lib/mongodb";

export const fetchUserByClerkId = async (clerkId: string) => {
  try {
    if (!clerkId) {
        throw new Error('Clerk ID is required');
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const userData = await db.collection('users').findOne({ clerkUserId: clerkId });

    return userData;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

// Define allowed update fields
interface UserUpdateData {
  role?: 'host' | 'player';
  plan?: 'basic' | 'pro' | 'premium';
}

export const updateUserField = async (userId: string, updateData: Partial<UserUpdateData>) => {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const result = await db.collection('users').updateOne(
        { clerkUserId: userId },
        { $set: updateData }
    );

    if (result.matchedCount === 1 && result.modifiedCount === 0) {
        console.log('User does not need to be updated');
        return;
    }

    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
