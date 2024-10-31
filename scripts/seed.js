require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = 'room_code';

async function generateUniqueCodes(count) {
  const existingCodes = new Set();

  while (existingCodes.size < count) {
    const newCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    existingCodes.add(newCode);
  }

  return Array.from(existingCodes).map(code => ({ code, status: false }));
}

async function main() {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Generate 1,000 unique room codes
    const codes = await generateUniqueCodes(1000);

    // Insert codes into the collection
    const result = await collection.insertMany(codes);
    console.log(`Inserted ${result.insertedCount} codes`);

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
