import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const fetchCache = 'force-no-store';

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  try {
    // Log the connection attempt
    await client.connect();

    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('room_code');
    
    // Log the query attempt
    const roomCode = await collection.findOneAndUpdate(
      { status: false },
      { $set: { status: true }, $inc: { version: 1 } },
      { returnDocument: 'after' }
    );

    return NextResponse.json(roomCode, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching room code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
