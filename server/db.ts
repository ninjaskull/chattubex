import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with optimized settings for faster connections
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Replit internal PostgreSQL doesn't need SSL
  max: 10, // Increased pool size
  min: 2,  // Keep minimum connections alive
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 5000, // Increased timeout
  allowExitOnIdle: false, // Keep pool alive
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle(pool, { schema });

// Test connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Initialize connection
testConnection().catch(console.error);