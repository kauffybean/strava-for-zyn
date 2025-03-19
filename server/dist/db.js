"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
exports.initDatabase = initDatabase;
exports.createTables = createTables;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require('./shared/db'));
// Create a PostgreSQL connection pool
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 5000,
});
// Create a Drizzle ORM instance
exports.db = (0, node_postgres_1.drizzle)(exports.pool, { schema });
// Initialize the database connection
async function initDatabase() {
    try {
        // Test the connection
        const client = await exports.pool.connect();
        console.log('Connected to PostgreSQL database');
        client.release();
        return true;
    }
    catch (error) {
        console.error('Error connecting to PostgreSQL database:', error);
        throw error;
    }
}
// Create tables if they don't exist
async function createTables() {
    try {
        // Create users table if it doesn't exist
        await exports.pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(100) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "displayName" VARCHAR(100) NOT NULL,
        "bio" TEXT,
        "avatar" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
        // Create friends table if it doesn't exist
        await exports.pool.query(`
      CREATE TABLE IF NOT EXISTS "friends" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "friendId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted')),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE ("userId", "friendId")
      );
    `);
        // Create posts table if it doesn't exist
        await exports.pool.query(`
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
    `);
        // Create comments table if it doesn't exist
        await exports.pool.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "postId" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
        // Create reactions table if it doesn't exist
        await exports.pool.query(`
      CREATE TABLE IF NOT EXISTS "reactions" (
        "id" SERIAL PRIMARY KEY,
        "postId" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" VARCHAR(20) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE ("postId", "userId")
      );
    `);
        // Create sessions table if it doesn't exist (for connect-pg-simple)
        await exports.pool.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      );
    `);
        console.log('Database tables created or verified');
        return true;
    }
    catch (error) {
        console.error('Error creating database tables:', error);
        throw error;
    }
}
