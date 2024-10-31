import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const collection = db.collection("rooms");
    const { roomId, players } = await request.json();

    if (!roomId || !players) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await collection.updateOne(
      { _id: ObjectId.createFromHexString(roomId) },
      { $set: { players } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Room not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ message: "Players updated successfully" });
  } catch (error) {
    console.error("Error updating players:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
