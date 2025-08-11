import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use Neon database with branch if available, then fallback to regular Neon, then local DATABASE_URL
const databaseUrl = process.env.NEON_DATABASE_URL_WITH_BRANCH || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "NEON_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with Neon-optimized settings
export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false, // SSL for Neon
  max: 10, // Higher pool size for Neon
  min: 2,  // Keep some connections alive
  idleTimeoutMillis: 60000, // Longer idle timeout for cloud
  connectionTimeoutMillis: 20000, // Longer timeout for cloud connection
  allowExitOnIdle: false, // Keep pool alive for cloud database
  query_timeout: 30000, // Longer query timeout for cloud
  statement_timeout: 30000, // Longer statement timeout for cloud
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