import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { questions, roomId } = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const roomsCollection = db.collection('rooms');

    const result = await roomsCollection.updateOne(
      { _id: ObjectId.createFromHexString(roomId) },
      { $set: questions },
    )

    if (result.modifiedCount === 0) {
      console.error('Failed to update room questions - No documents modified');
      return NextResponse.json({ error: 'Failed to update room questions' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating room questions:', error);
    return NextResponse.json({ error: 'Failed to update room questions' }, { status: 500 });
  }
}
