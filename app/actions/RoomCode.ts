'use server'

import clientPromise from "@/lib/mongodb";

export const fetchRoomCode = async () => {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);    
    const roomCode = await db.collection('room_code').findOneAndUpdate(
      { status: false },
      { $set: { status: true }, $inc: { version: 1 } },
      { returnDocument: 'after' }
    );

    return roomCode;
  } catch (error) {
    console.error('Error fetching room code:', error);
    throw error;
  }
}