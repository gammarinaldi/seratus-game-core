'use server'

import clientPromise from "@/lib/mongodb";
import { Player, RoomParams } from "@/app/types/quiz"
import { ObjectId } from 'mongodb';
import { fetchRoomCode } from "./RoomCode";

export const createRoom = async (params: RoomParams) => {
    try {
        const { createdBy, totalPlayers, totalQuestions, plan, orderId } = params;
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const roomCode = await fetchRoomCode();
        const newRoom = {
          _id: new ObjectId(),
          createdBy: createdBy,
          roomCode: roomCode?.code,
          plan: plan,
          players: [],
          status: 'waiting',
          totalPlayers,
          totalQuestions,
          orderId,
        };
    
        const result = await db.collection('rooms').insertOne(newRoom);
        const responseData = { ...newRoom, _id: result.insertedId };
        return responseData;
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
}

export const fetchRoomById = async (roomId: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const room = await db.collection('rooms').findOne({ 
            _id: ObjectId.createFromHexString(roomId),
        });
        
        return room;
    } catch (error) {
        console.error('Error fetching room by ID:', error);
        throw error;
    }
}

export const fetchRoomByCode = async (roomCode: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const room = await db.collection('rooms').findOne({ 
            roomCode: roomCode,
        });
        
        if (!room) return null;
        
        // Convert MongoDB document to plain object and transform _id
        const plainRoom = JSON.parse(JSON.stringify(room));
        return plainRoom;
    } catch (error) {
        console.error('Error fetching room by code:', error);
        throw error;
    }
}

export const fetchRoomByCreatedBy = async (createdBy: string, status: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const room = await db.collection('rooms').findOne({ 
            createdBy: createdBy,
            status: status
        });
        
        return room;
    } catch (error) {
        console.error('Error fetching room by creator:', error);
        throw error;
    }
}

export const updateRoomOrders = async (roomId: string, orderId: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const result = await db.collection('rooms').updateOne(
            { _id: ObjectId.createFromHexString(roomId) },
            { $set: { orderId: orderId } },
        )
  
        if (result.modifiedCount === 0) {
            console.error('Failed to update room orders - No documents modified');
            throw new Error('Failed to update room orders - No documents modified');
        }
        return result;
    } catch (error) {
        console.error('Error updating room orders:', error);
        throw error;
    }
}

export const updateRoomStatus = async (roomId: string, status: string, players: Player[]) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const result = await db.collection('rooms').updateOne(
            { _id: ObjectId.createFromHexString(roomId) },
            { $set: { status: status, players: players } },
        )
  
        if (result.modifiedCount === 0) {
            console.error('Failed to update room status - No documents modified');
            throw new Error('Failed to update room status - No documents modified');
        }
        return result;
    } catch (error) {
        console.error('Error updating room status:', error);
        throw error;
    }
}
