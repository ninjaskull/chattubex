import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Function to get database URL with proper fallback
function getDatabaseUrl(): string {
  // Helper function to check if a string is valid and not empty/whitespace
  const isValidUrl = (url: string | undefined): url is string => {
    return !!url && url.trim() !== '';
  };
  
  // Try environment variables in priority order
  const neonWithBranch = process.env.NEON_DATABASE_URL_WITH_BRANCH;
  const neonUrl = process.env.NEON_DATABASE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  // Use the first valid URL found
  if (isValidUrl(neonWithBranch)) {
    console.log('Using NEON_DATABASE_URL_WITH_BRANCH');
    return neonWithBranch;
  }
  
  if (isValidUrl(neonUrl)) {
    console.log('Using NEON_DATABASE_URL');
    return neonUrl;
  }
  
  if (isValidUrl(databaseUrl)) {
    console.log('Using DATABASE_URL');
    return databaseUrl;
  }
  
  // If no database URL is found, try to construct one from individual postgres env vars
  if (isValidUrl(process.env.PGHOST) && isValidUrl(process.env.PGDATABASE) && isValidUrl(process.env.PGUSER)) {
    const pgHost = process.env.PGHOST!.trim();
    const pgPort = process.env.PGPORT?.trim() || '5432';
    const pgDatabase = process.env.PGDATABASE!.trim();
    const pgUser = process.env.PGUSER!.trim();
    const pgPassword = process.env.PGPASSWORD?.trim() || '';
    
    const constructedUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
    console.log('Constructed database URL from individual PostgreSQL environment variables');
    return constructedUrl;
  }

  // If we still don't have a URL, throw an error
  console.error("Database URL not found. Please ensure DATABASE_URL environment variable is set.");
  console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON') || key.includes('PG')));
  throw new Error(
    "Database URL must be set. Did you forget to provision a database?",
  );
}

// Function to get read-only database URL for Duggu chatbot
function getReadOnlyDatabaseUrl(): string {
  // Use the external Neon database specifically for Duggu chatbot contacts
  let dugguConnectionUrl = process.env.DUGGU_DATABASE_CONNECTION_URL;
  
  if (dugguConnectionUrl) {
    // Clean up the connection URL - remove any psql command prefixes
    if (dugguConnectionUrl.includes("'postgresql://")) {
      dugguConnectionUrl = dugguConnectionUrl.match(/'(postgresql:\/\/[^']+)'/)?.[1] || dugguConnectionUrl;
    } else if (dugguConnectionUrl.includes('"postgresql://')) {
      dugguConnectionUrl = dugguConnectionUrl.match(/"(postgresql:\/\/[^"]+)"/)?.[1] || dugguConnectionUrl;
    }
    
    if (dugguConnectionUrl.startsWith('postgresql://') || dugguConnectionUrl.startsWith('postgres://')) {
      console.log('Using external Neon database for Duggu chatbot contacts access');
      return dugguConnectionUrl;
    }
  }
  
  // If the new connection URL is not available, check the old API key variable
  const dugguApiKey = process.env.DUGGU_NEON_DATABASE_URL;
  
  if (dugguApiKey) {
    if (dugguApiKey.startsWith('postgresql://') || dugguApiKey.startsWith('postgres://')) {
      console.log('Using external Neon database for Duggu chatbot contacts access (from legacy variable)');
      return dugguApiKey;
    }
    
    console.log('DUGGU_NEON_DATABASE_URL appears to be an API key. Please provide the full database connection URL instead.');
  }
  
  // For now, fallback to main database to keep the service running
  console.log('Falling back to main database for Duggu chatbot until proper connection URL is provided');
  return getDatabaseUrl();
}

const databaseUrl = getDatabaseUrl();
const readOnlyDatabaseUrl = getReadOnlyDatabaseUrl();

// Main database pool for write operations
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

// Read-only database pool specifically for Duggu chatbot searches
export const readOnlyPool = new Pool({
  connectionString: readOnlyDatabaseUrl,
  ssl: readOnlyDatabaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false, // SSL for Neon
  max: 5, // Smaller pool size for read-only operations
  min: 1,  // Keep minimal connections alive
  idleTimeoutMillis: 30000, // Shorter idle timeout for read operations
  connectionTimeoutMillis: 15000, // Shorter timeout for read operations
  allowExitOnIdle: false, // Keep pool alive
  query_timeout: 15000, // Shorter query timeout for searches
  statement_timeout: 15000, // Shorter statement timeout for searches
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Main database pool error:', err);
});

readOnlyPool.on('error', (err) => {
  console.error('Read-only database pool error:', err);
});

// Main database instance
export const db = drizzle(pool, { schema });

// Read-only database instance for Duggu chatbot
export const readOnlyDb = drizzle(readOnlyPool, { schema });

// Test connection on startup with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Main database connection established successfully');
      return;
    } catch (error) {
      console.error(`Main database connection attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : String(error));
      if (i === retries - 1) {
        console.error('All main database connection attempts failed. Continuing without database...');
        return; // Don't throw error, allow app to start
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Test read-only connection for Duggu chatbot
async function testReadOnlyConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await readOnlyPool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Read-only database connection for Duggu chatbot established successfully');
      return;
    } catch (error) {
      console.error(`Read-only database connection attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : String(error));
      if (i === retries - 1) {
        console.error('All read-only database connection attempts failed. Duggu chatbot will continue without database access...');
        return; // Don't throw error, allow app to start
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Initialize connections with graceful failure
Promise.all([
  testConnection().catch(() => {
    console.log('Main database connection failed but application will continue to start');
  }),
  testReadOnlyConnection().catch(() => {
    console.log('Read-only database connection failed but Duggu chatbot will continue to start');
  })
]).then(() => {
  console.log('Database initialization completed');
});