import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Function to get database URL with proper fallback
function getDatabaseUrl(): string {
  // Use Neon database with branch if available, then fallback to regular Neon, then local DATABASE_URL
  let databaseUrl = process.env.NEON_DATABASE_URL_WITH_BRANCH || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  console.log('Checking database URL availability...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);
  console.log('NEON_DATABASE_URL_WITH_BRANCH exists:', !!process.env.NEON_DATABASE_URL_WITH_BRANCH);
  console.log('Selected database URL exists:', !!databaseUrl);

  // If no database URL is found, try to construct one from individual postgres env vars
  if (!databaseUrl && process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER) {
    const pgHost = process.env.PGHOST;
    const pgPort = process.env.PGPORT || '5432';
    const pgDatabase = process.env.PGDATABASE;
    const pgUser = process.env.PGUSER;
    const pgPassword = process.env.PGPASSWORD || '';
    
    databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
    console.log('Constructed database URL from individual PostgreSQL environment variables');
  }

  if (!databaseUrl) {
    console.error("Database URL not found. Please ensure DATABASE_URL environment variable is set.");
    console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON') || key.includes('PG')));
    throw new Error(
      "Database URL must be set. Did you forget to provision a database?",
    );
  }

  console.log('Using database URL from:', 
    process.env.NEON_DATABASE_URL_WITH_BRANCH ? 'NEON_DATABASE_URL_WITH_BRANCH' :
    process.env.NEON_DATABASE_URL ? 'NEON_DATABASE_URL' : 
    process.env.DATABASE_URL ? 'DATABASE_URL' : 'constructed from PG env vars'
  );
  
  return databaseUrl;
}

const databaseUrl = getDatabaseUrl();

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