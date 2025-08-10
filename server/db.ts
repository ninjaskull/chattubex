import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with Replit-optimized settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Replit internal database doesn't need SSL
  max: 5, // Reduced pool size for Replit
  min: 1,  // Minimal connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Longer timeout for Replit
  allowExitOnIdle: true, // Allow pool to close when idle
  query_timeout: 15000, // Query timeout
  statement_timeout: 15000, // Statement timeout
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle(pool, { schema });

// Test connection on startup with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Database connection established successfully');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : String(error));
      if (i === retries - 1) {
        console.error('All database connection attempts failed. Continuing without database...');
        return; // Don't throw error, allow app to start
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Initialize connection with graceful failure
testConnection().catch(() => {
  console.log('Database connection failed but application will continue to start');
});