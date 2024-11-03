'use server'

import { currentUser } from "@clerk/nextjs/server";
import { User } from '@/app/types/user';
import clientPromise from "@/lib/mongodb";

export const checkUser = async (): Promise<User | null> => {
  console.log("Starting checkUser function");
  
  try {
    const user = await currentUser();
    
    if (!user) {
      console.log("No user logged in, returning null");
      return null;
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME as string);
    const loggedInUser = await db.collection('users').findOne({ clerkUserId: user.id });

    if (loggedInUser) {
      // Convert MongoDB document to User type
      const userDoc = {
        _id: loggedInUser._id.toString(),
        clerkUserId: loggedInUser.clerkUserId,
        name: loggedInUser.name,
        imageUrl: loggedInUser.imageUrl,
        email: loggedInUser.email,
        createdAt: loggedInUser.createdAt,
        updatedAt: loggedInUser.updatedAt
      } as User;

      return userDoc;
    }

    // Create new user without _id for MongoDB insertion
    const newUserDoc = {
      clerkUserId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUserDoc);
    
    // Create User type with string _id for our application
    const createdUser: User = {
      ...newUserDoc,
      _id: result.insertedId.toString()
    };
    
    return createdUser;
  } catch (error) {
    console.error('Error in checkUser:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      throw new Error(`Please try again. Authentication error: ${error.message}`);
    }
    throw new Error('An unexpected authentication error occurred. Please try again.');
  }
}