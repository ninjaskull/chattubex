import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

// Get the external database URL for inspection
function getExternalDatabaseUrl(): string | null {
  let dugguConnectionUrl = process.env.DUGGU_DATABASE_CONNECTION_URL;
  
  if (dugguConnectionUrl) {
    // Clean up the connection URL - remove any psql command prefixes
    if (dugguConnectionUrl.includes("'postgresql://")) {
      dugguConnectionUrl = dugguConnectionUrl.match(/'(postgresql:\/\/[^']+)'/)?.[1] || dugguConnectionUrl;
    } else if (dugguConnectionUrl.includes('"postgresql://')) {
      dugguConnectionUrl = dugguConnectionUrl.match(/"(postgresql:\/\/[^"]+)"/)?.[1] || dugguConnectionUrl;
    }
    
    if (dugguConnectionUrl.startsWith('postgresql://') || dugguConnectionUrl.startsWith('postgres://')) {
      return dugguConnectionUrl;
    }
  }
  
  return null;
}

// Lazy-load the connection pool only when needed
let externalPool: Pool | null = null;

function getExternalPool(): Pool {
  if (!externalPool) {
    const url = getExternalDatabaseUrl();
    if (!url) {
      throw new Error('External database connection URL not found. Please configure DUGGU_DATABASE_CONNECTION_URL environment variable.');
    }
    
    externalPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 2,
      min: 1,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: false,
      query_timeout: 10000,
      statement_timeout: 10000,
    });
  }
  
  return externalPool;
}

export class ExternalDbInspector {
  /**
   * Get all table names from the external database
   */
  async getTables(): Promise<string[]> {
    try {
      const pool = getExternalPool();
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      return result.rows.map(row => row.table_name);
    } catch (error) {
      console.error('Error getting tables from external database:', error);
      throw new Error('Failed to get tables');
    }
  }

  /**
   * Get column information for a specific table
   */
  async getTableSchema(tableName: string): Promise<any[]> {
    try {
      const pool = getExternalPool();
      const result = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      throw new Error(`Failed to get schema for table ${tableName}`);
    }
  }

  /**
   * Get a sample of data from a table to understand its structure
   */
  async getSampleData(tableName: string, limit: number = 3): Promise<any[]> {
    try {
      const pool = getExternalPool();
      const result = await pool.query(`
        SELECT * FROM ${tableName} LIMIT $1;
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting sample data from ${tableName}:`, error);
      throw new Error(`Failed to get sample data from ${tableName}`);
    }
  }

  /**
   * Get count of records in a table
   */
  async getTableCount(tableName: string): Promise<number> {
    try {
      const pool = getExternalPool();
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM ${tableName};
      `);
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error getting count from ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Find tables that might contain contact information
   */
  async findContactTables(): Promise<{tableName: string, columns: string[], count: number}[]> {
    try {
      const tables = await this.getTables();
      const contactTables = [];
      
      for (const table of tables) {
        try {
          const schema = await this.getTableSchema(table);
          const columnNames = schema.map(col => col.column_name.toLowerCase());
          
          // Look for tables that might contain contact information
          const hasContactIndicators = columnNames.some(col => 
            col.includes('email') || 
            col.includes('phone') || 
            col.includes('contact') ||
            col.includes('first') ||
            col.includes('last') ||
            col.includes('name') ||
            col.includes('company')
          );
          
          if (hasContactIndicators) {
            const count = await this.getTableCount(table);
            contactTables.push({
              tableName: table,
              columns: columnNames,
              count
            });
          }
        } catch (error) {
          console.log(`Skipping table ${table} due to access restrictions`);
        }
      }
      
      return contactTables;
    } catch (error) {
      console.error('Error finding contact tables:', error);
      throw new Error('Failed to find contact tables');
    }
  }
}

export const externalDbInspector = new ExternalDbInspector();