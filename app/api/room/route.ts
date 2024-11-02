import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('id');
  const roomCode = req.nextUrl.searchParams.get('code');
  const createdBy = req.nextUrl.searchParams.get('createdBy');

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME as string);
  const roomsCollection = db.collection('rooms');
  
  if (roomId) {
    const room = await roomsCollection.findOne({ _id: ObjectId.createFromHexString(roomId) });

    if (room) {
      return NextResponse.json(room, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
  } else if (roomCode) {
    const room = await roomsCollection.findOne({ roomCode: roomCode });

    if (room) {
      return NextResponse.json(room, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
  } else if (createdBy) {
    const room = await roomsCollection.findOne({ createdBy: createdBy });

    return NextResponse.json(room, { status: 200 });
  } else {
    return NextResponse.json({ error: 'Room ID or Room Code is required' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const { createdBy, totalPlayers, totalQuestions, roomCode } = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const roomsCollection = db.collection('rooms');

    const newRoom = {
      _id: new ObjectId(),
      totalPlayers,
      totalQuestions,
      timePerQuestion: 10,
      status: 'waiting',
      roomCode: roomCode,
      createdBy: createdBy,
      players: []
    };

    const result = await roomsCollection.insertOne(newRoom);
    const responseData = { ...newRoom, _id: result.insertedId };
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { roomDetails } = await req.json();
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const roomsCollection = db.collection('rooms');
    
    const updatedRoom = {
      players: roomDetails.players,
      status: roomDetails.status,
    }

    const result = await roomsCollection.updateOne(
      { _id: ObjectId.createFromHexString(roomDetails.roomId) },
      { $set: updatedRoom },
    );

    if (result.modifiedCount === 0) {
      console.error('Failed to update room - No documents modified', roomDetails);
      return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...updatedRoom }, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}
