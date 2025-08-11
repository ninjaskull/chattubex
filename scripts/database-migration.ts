import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Old database configuration
const OLD_DATABASE_URL = "postgresql://sunil:sunil123@localhost:5432/campaign_db";

// New database (current app database)
const NEW_DATABASE_URL = process.env.DATABASE_URL;

if (!NEW_DATABASE_URL) {
  throw new Error("NEW DATABASE_URL must be set");
}

// Create connections
const oldPool = new Pool({ 
  connectionString: OLD_DATABASE_URL,
  ssl: false
});

const newPool = new Pool({ 
  connectionString: NEW_DATABASE_URL,
  ssl: false
});

const oldDb = drizzle(oldPool, { schema });
const newDb = drizzle(newPool, { schema });

interface MigrationResult {
  table: string;
  recordsFound: number;
  recordsMigrated: number;
  errors: string[];
}

async function testConnections() {
  console.log('Testing database connections...');
  
  try {
    // Test old database
    const oldClient = await oldPool.connect();
    await oldClient.query('SELECT 1');
    oldClient.release();
    console.log('✓ Old database connection successful');
  } catch (error) {
    console.error('✗ Old database connection failed:', error instanceof Error ? error.message : String(error));
    throw new Error('Cannot connect to old database. Please ensure it is accessible.');
  }

  try {
    // Test new database
    const newClient = await newPool.connect();
    await newClient.query('SELECT 1');
    newClient.release();
    console.log('✓ New database connection successful');
  } catch (error) {
    console.error('✗ New database connection failed:', error instanceof Error ? error.message : String(error));
    throw new Error('Cannot connect to new database.');
  }
}

async function getTableList(pool: Pool): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return result.rows.map(row => row.table_name);
  } finally {
    client.release();
  }
}

async function getTableStructure(pool: Pool, tableName: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows;
  } finally {
    client.release();
  }
}

async function migrateTable(tableName: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    table: tableName,
    recordsFound: 0,
    recordsMigrated: 0,
    errors: []
  };

  try {
    console.log(`\nMigrating table: ${tableName}`);
    
    // Get all data from old table
    const oldClient = await oldPool.connect();
    const selectResult = await oldClient.query(`SELECT * FROM "${tableName}"`);
    oldClient.release();
    
    result.recordsFound = selectResult.rows.length;
    console.log(`Found ${result.recordsFound} records in ${tableName}`);

    if (result.recordsFound === 0) {
      console.log(`No data to migrate for ${tableName}`);
      return result;
    }

    // Get table structure to build insert query
    const columns = selectResult.fields.map(field => field.name);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.map(col => `"${col}"`).join(', ');
    
    const insertQuery = `
      INSERT INTO "${tableName}" (${columnNames}) 
      VALUES (${placeholders})
      ON CONFLICT DO NOTHING
    `;

    // Insert data into new database
    const newClient = await newPool.connect();
    
    try {
      await newClient.query('BEGIN');
      
      for (const row of selectResult.rows) {
        try {
          const values = columns.map(col => row[col]);
          await newClient.query(insertQuery, values);
          result.recordsMigrated++;
        } catch (error) {
          const errorMsg = `Row migration failed: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          console.warn(`Warning: ${errorMsg}`);
        }
      }
      
      await newClient.query('COMMIT');
      console.log(`✓ Successfully migrated ${result.recordsMigrated}/${result.recordsFound} records for ${tableName}`);
      
    } catch (error) {
      await newClient.query('ROLLBACK');
      throw error;
    } finally {
      newClient.release();
    }

  } catch (error) {
    const errorMsg = `Table migration failed: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMsg);
    console.error(`✗ ${errorMsg}`);
  }

  return result;
}

async function generateMigrationReport(results: MigrationResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const totalTables = results.length;
  const successfulTables = results.filter(r => r.errors.length === 0).length;
  const totalRecordsFound = results.reduce((sum, r) => sum + r.recordsFound, 0);
  const totalRecordsMigrated = results.reduce((sum, r) => sum + r.recordsMigrated, 0);
  
  console.log(`Tables processed: ${totalTables}`);
  console.log(`Tables successfully migrated: ${successfulTables}`);
  console.log(`Total records found: ${totalRecordsFound}`);
  console.log(`Total records migrated: ${totalRecordsMigrated}`);
  console.log(`Migration success rate: ${((totalRecordsMigrated / Math.max(totalRecordsFound, 1)) * 100).toFixed(1)}%`);
  
  console.log('\nDETAILED RESULTS:');
  console.log('-'.repeat(60));
  
  for (const result of results) {
    const status = result.errors.length === 0 ? '✓' : '✗';
    console.log(`${status} ${result.table}: ${result.recordsMigrated}/${result.recordsFound} records`);
    
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`);
      result.errors.slice(0, 3).forEach(error => {
        console.log(`    - ${error}`);
      });
      if (result.errors.length > 3) {
        console.log(`    ... and ${result.errors.length - 3} more errors`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

async function performMigration() {
  try {
    console.log('Starting database migration process...');
    console.log(`From: ${OLD_DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
    console.log(`To: ${NEW_DATABASE_URL!.replace(/:[^:@]*@/, ':****@')}`);
    
    // Test connections
    await testConnections();
    
    // Get list of tables from old database
    const tables = await getTableList(oldPool);
    console.log(`\nFound ${tables.length} tables to migrate:`, tables.join(', '));
    
    // Migrate each table
    const results: MigrationResult[] = [];
    
    for (const table of tables) {
      const result = await migrateTable(table);
      results.push(result);
    }
    
    // Generate report
    await generateMigrationReport(results);
    
    // Check if migration was successful
    const hasErrors = results.some(r => r.errors.length > 0);
    if (hasErrors) {
      console.log('\n⚠️  Migration completed with some errors. Please review the report above.');
    } else {
      console.log('\n🎉 Migration completed successfully! All data has been transferred.');
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    // Close connections
    await oldPool.end();
    await newPool.end();
  }
}

// Add command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  performMigration().then(() => {
    console.log('\nMigration process completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
}

export { performMigration, testConnections };