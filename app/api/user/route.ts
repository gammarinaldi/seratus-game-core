import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const clerkId = req.nextUrl.searchParams.get('clerkId');

        if (!clerkId) {
            return NextResponse.json({ error: 'Clerk ID is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const usersCollection = db.collection('users');
        const userData = await usersCollection.findOne({ clerkUserId: clerkId });
        
        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { userId, ...updateData } = await req.json();
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME as string);
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { clerkUserId: userId },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            console.error('Failed to update user');
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
