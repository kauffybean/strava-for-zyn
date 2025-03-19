import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/db';
import { eq, sql } from 'drizzle-orm';

// Create a PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Initialize the database connection
export async function initDatabase() {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    throw error;
  }
}

// Create tables if they don't exist
export async function createTables() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(100) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "displayName" VARCHAR(100) NOT NULL,
        "bio" TEXT,
        "avatar" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `.execute(pool);

    // Create friends table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "friends" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "friendId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted')),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE ("userId", "friendId")
      );
    `.execute(pool);

    // Create posts table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "latitude" DECIMAL,
        "longitude" DECIMAL,
        "locationName" VARCHAR(255),
        "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "duration" INTEGER,
        "nicotineStrength" DECIMAL NOT NULL,
        "flavor" VARCHAR(100) NOT NULL,
        "mood" VARCHAR(100) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `.execute(pool);

    // Create comments table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "postId" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `.execute(pool);

    // Create reactions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "reactions" (
        "id" SERIAL PRIMARY KEY,
        "postId" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" VARCHAR(20) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE ("postId", "userId")
      );
    `.execute(pool);

    // Create sessions table if it doesn't exist (for connect-pg-simple)
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      );
    `.execute(pool);

    console.log('Database tables created or verified');
    return true;
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}